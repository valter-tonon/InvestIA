import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database';
import { StrategyRule } from '../../knowledge-base/domain/entities/strategy-profile.entity';

export interface AssetData {
    ticker: string;
    currentPrice?: number;
    dividendYield?: number;
    priceToEarnings?: number;
    priceToBook?: number;
    roe?: number;
    netMargin?: number;
    debtToEquity?: number;
    [key: string]: string | number | undefined;
}

export interface RuleResult {
    rule: StrategyRule;
    passed: boolean;
    actualValue: number | null;
    expectedValue: number;
}

export interface AnalysisResult {
    ticker: string;
    strategyProfileId: string;
    strategyProfileName: string;
    passed: boolean;
    score: number; // 0-100
    totalRules: number;
    passedRules: number;
    ruleResults: RuleResult[];
}

/**
 * AnalysisEngineService
 * 
 * Motor de análise que executa regras dinâmicas (JSON) contra dados de mercado
 * Sem usar IF fixo para cada indicador - totalmente dinâmico
 */
@Injectable()
export class AnalysisEngineService {
    private readonly logger = new Logger(AnalysisEngineService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Analisa um ativo contra um perfil de estratégia específico
     */
    async analyzeAsset(
        ticker: string,
        strategyProfileId: string,
    ): Promise<AnalysisResult | null> {
        // Busca o ativo
        const asset = await this.prisma.asset.findUnique({
            where: { ticker },
        });

        if (!asset) {
            this.logger.warn(`Ativo ${ticker} não encontrado`);
            return null;
        }

        // Busca o perfil de estratégia
        const profile = await this.prisma.strategyProfile.findUnique({
            where: { id: strategyProfileId },
        });

        if (!profile) {
            this.logger.warn(`StrategyProfile ${strategyProfileId} não encontrado`);
            return null;
        }

        const rules = profile.rules as unknown as StrategyRule[];
        return this.executeRules(asset as unknown as AssetData, profile.id, profile.name, rules);
    }

    /**
     * Analisa um ativo contra todos os perfis ativos do usuário
     */
    async analyzeAssetAgainstAllProfiles(
        ticker: string,
        userId: string,
    ): Promise<AnalysisResult[]> {
        const asset = await this.prisma.asset.findUnique({
            where: { ticker },
        });

        if (!asset) {
            this.logger.warn(`Ativo ${ticker} não encontrado`);
            return [];
        }

        const profiles = await this.prisma.strategyProfile.findMany({
            where: { userId, isActive: true },
        });

        const results: AnalysisResult[] = [];

        for (const profile of profiles) {
            const rules = profile.rules as unknown as StrategyRule[];
            const result = this.executeRules(
                asset as unknown as AssetData,
                profile.id,
                profile.name,
                rules,
            );
            results.push(result);
        }

        return results;
    }

    /**
     * Executa um conjunto de regras contra dados de um ativo
     * TOTALMENTE DINÂMICO - sem IF fixo por indicador
     */
    private executeRules(
        assetData: AssetData,
        profileId: string,
        profileName: string,
        rules: StrategyRule[],
    ): AnalysisResult {
        const ruleResults: RuleResult[] = [];
        let totalWeight = 0;
        let weightedScore = 0;

        for (const rule of rules) {
            const actualValue = this.getIndicatorValue(assetData, rule.indicator);
            const passed = this.evaluateRule(actualValue, rule.operator, rule.value);
            const weight = rule.weight ?? 1;

            ruleResults.push({
                rule,
                passed,
                actualValue,
                expectedValue: rule.value,
            });

            totalWeight += weight;
            if (passed) {
                weightedScore += weight;
            }
        }

        const score = totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 0;
        const passedRules = ruleResults.filter((r) => r.passed).length;
        const overallPassed = score >= 70; // Considera aprovado se score >= 70%

        return {
            ticker: assetData.ticker,
            strategyProfileId: profileId,
            strategyProfileName: profileName,
            passed: overallPassed,
            score,
            totalRules: rules.length,
            passedRules,
            ruleResults,
        };
    }

    /**
     * Obtém o valor de um indicador do ativo de forma dinâmica
     */
    private getIndicatorValue(asset: AssetData, indicator: string): number | null {
        // Mapeamento de aliases para campos reais
        const fieldMap: Record<string, string> = {
            dy: 'dividendYield',
            pe: 'priceToEarnings',
            priceEarnings: 'priceToEarnings',
            pb: 'priceToBook',
            debtEquity: 'debtToEquity',
        };

        const field = fieldMap[indicator] || indicator;
        const value = asset[field];

        return typeof value === 'number' ? value : null;
    }

    /**
     * Avalia uma regra dinamicamente usando o operador especificado
     */
    private evaluateRule(
        actualValue: number | null,
        operator: string,
        targetValue: number,
    ): boolean {
        if (actualValue === null || actualValue === undefined) {
            return false; // Dados não disponíveis = regra não passa
        }

        // Operadores dinâmicos - SEM IF PARA CADA INDICADOR
        const operators: Record<string, (a: number, b: number) => boolean> = {
            '>': (a, b) => a > b,
            '<': (a, b) => a < b,
            '>=': (a, b) => a >= b,
            '<=': (a, b) => a <= b,
            '==': (a, b) => a === b,
            '!=': (a, b) => a !== b,
        };

        const evaluator = operators[operator];
        if (!evaluator) {
            this.logger.warn(`Operador desconhecido: ${operator}`);
            return false;
        }

        return evaluator(actualValue, targetValue);
    }

    /**
     * Filtra ativos que passam em um perfil de estratégia
     */
    async filterAssetsByStrategy(
        strategyProfileId: string,
        minScore = 70,
    ): Promise<{ ticker: string; score: number }[]> {
        const profile = await this.prisma.strategyProfile.findUnique({
            where: { id: strategyProfileId },
        });

        if (!profile) {
            return [];
        }

        const rules = profile.rules as unknown as StrategyRule[];
        const assets = await this.prisma.asset.findMany();

        const results: { ticker: string; score: number }[] = [];

        for (const asset of assets) {
            const analysis = this.executeRules(
                asset as unknown as AssetData,
                profile.id,
                profile.name,
                rules,
            );

            if (analysis.score >= minScore) {
                results.push({
                    ticker: asset.ticker,
                    score: analysis.score,
                });
            }
        }

        // Ordena por score decrescente
        return results.sort((a, b) => b.score - a.score);
    }
}
