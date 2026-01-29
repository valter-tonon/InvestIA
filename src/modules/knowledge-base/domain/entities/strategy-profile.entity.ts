/**
 * Entidade que representa um perfil de estratégia de investimento
 * Contém regras dinâmicas extraídas de filosofias de investimento (Warren Buffett, Bazin, etc)
 */

export interface StrategyRule {
    indicator: string; // ex: 'dy', 'pe', 'roe', 'netMargin', 'debtEquity'
    operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
    value: number;
    weight?: number; // Peso da regra na pontuação final (0-1)
    description?: string;
}

export interface StrategyProfileEntity {
    id: string;
    name: string;
    description?: string;
    rules: StrategyRule[];
    sourceType?: 'PDF' | 'TEXT' | 'URL';
    sourceRef?: string;
    isActive: boolean;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Valida se um conjunto de regras tem formato válido
 */
export function validateRules(rules: StrategyRule[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const validOperators = ['>', '<', '>=', '<=', '==', '!='];
    const validIndicators = [
        'dy', 'dividendYield',
        'pe', 'priceEarnings', 'priceToEarnings',
        'pb', 'priceToBook',
        'roe',
        'netMargin',
        'debtEquity', 'debtToEquity',
        'currentPrice',
    ];

    for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];

        if (!rule.indicator) {
            errors.push(`Regra ${i + 1}: indicador não especificado`);
        } else if (!validIndicators.includes(rule.indicator)) {
            errors.push(`Regra ${i + 1}: indicador '${rule.indicator}' inválido`);
        }

        if (!rule.operator) {
            errors.push(`Regra ${i + 1}: operador não especificado`);
        } else if (!validOperators.includes(rule.operator)) {
            errors.push(`Regra ${i + 1}: operador '${rule.operator}' inválido`);
        }

        if (rule.value === undefined || rule.value === null) {
            errors.push(`Regra ${i + 1}: valor não especificado`);
        } else if (typeof rule.value !== 'number') {
            errors.push(`Regra ${i + 1}: valor deve ser numérico`);
        }

        if (rule.weight !== undefined && (rule.weight < 0 || rule.weight > 1)) {
            errors.push(`Regra ${i + 1}: peso deve estar entre 0 e 1`);
        }
    }

    return { valid: errors.length === 0, errors };
}
