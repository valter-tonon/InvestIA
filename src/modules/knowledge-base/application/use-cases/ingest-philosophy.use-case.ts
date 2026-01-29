import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database';
import { StrategyRule, validateRules } from '../../domain/entities/strategy-profile.entity';

export interface IngestPhilosophyInput {
    name: string;
    description?: string;
    rawRules: StrategyRule[];
    sourceType?: 'PDF' | 'TEXT' | 'URL';
    sourceRef?: string;
    userId: string;
}

export interface IngestPhilosophyOutput {
    id: string;
    name: string;
    rulesCount: number;
}

/**
 * Use Case: Ingest Philosophy
 * 
 * Recebe regras de investimento (extraídas de PDFs, textos ou URLs via LLM)
 * Valida as regras e salva no banco de dados como um StrategyProfile
 */
@Injectable()
export class IngestPhilosophyUseCase {
    private readonly logger = new Logger(IngestPhilosophyUseCase.name);

    constructor(private readonly prisma: PrismaService) { }

    async execute(input: IngestPhilosophyInput): Promise<IngestPhilosophyOutput> {
        this.logger.log(`Ingerindo filosofia: ${input.name}`);

        // Valida as regras
        const validation = validateRules(input.rawRules);
        if (!validation.valid) {
            throw new Error(`Regras inválidas: ${validation.errors.join('; ')}`);
        }

        // Normaliza os indicadores para o formato padrão
        const normalizedRules = this.normalizeRules(input.rawRules);

        // Salva no banco
        const profile = await this.prisma.strategyProfile.create({
            data: {
                name: input.name,
                description: input.description,
                rules: normalizedRules as unknown as object,
                sourceType: input.sourceType,
                sourceRef: input.sourceRef,
                userId: input.userId,
                isActive: true,
            },
        });

        this.logger.log(`Filosofia criada com ID: ${profile.id}`);

        return {
            id: profile.id,
            name: profile.name,
            rulesCount: normalizedRules.length,
        };
    }

    /**
     * Normaliza os nomes dos indicadores para o formato do banco
     */
    private normalizeRules(rules: StrategyRule[]): StrategyRule[] {
        const indicatorMap: Record<string, string> = {
            'dy': 'dividendYield',
            'pe': 'priceToEarnings',
            'priceEarnings': 'priceToEarnings',
            'pb': 'priceToBook',
            'debtEquity': 'debtToEquity',
        };

        return rules.map((rule) => ({
            ...rule,
            indicator: indicatorMap[rule.indicator] || rule.indicator,
            weight: rule.weight ?? 1,
        }));
    }
}
