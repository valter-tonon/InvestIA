/**
 * Formata valor monetário para exibição (BRL)
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(amount);
};

/**
 * Calcula o valor mensal equivalente para planos anuais
 */
export const calculateMonthlyEquivalent = (
    price: number,
    interval: 'MONTHLY' | 'YEARLY'
): number => {
    if (interval === 'MONTHLY') return price;
    return price / 12;
};

/**
 * Retorna o texto do intervalo em português
 */
export const getIntervalLabel = (interval: 'MONTHLY' | 'YEARLY'): string => {
    return interval === 'MONTHLY' ? 'mês' : 'ano';
};
