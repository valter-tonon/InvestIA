export interface CalculatorResult {
    year: number;
    invested: number;
    interest: number;
    total: number;
    realTotal?: number; // Adjusted for inflation
}

export const calculateCompoundInterest = (
    initial: number,
    monthly: number,
    rateAnnual: number,
    years: number,
    inflationAnnual: number = 0
): CalculatorResult[] => {
    const months = years * 12;
    const rateMonthly = Math.pow(1 + rateAnnual / 100, 1 / 12) - 1;
    const inflationMonthly = Math.pow(1 + inflationAnnual / 100, 1 / 12) - 1;

    // Real rate approximation: (1 + nominal) / (1 + inflation) - 1
    const realRateMonthly = ((1 + rateMonthly) / (1 + inflationMonthly)) - 1;

    let currentTotal = initial;
    let currentInvested = initial;
    let currentRealTotal = initial;

    const results: CalculatorResult[] = [];

    // Push initial state (Year 0)
    results.push({
        year: 0,
        invested: initial,
        interest: 0,
        total: initial,
        realTotal: initial
    });

    for (let i = 1; i <= months; i++) {
        // Apply interest first (start of month vs end of month convention varies, 
        // usually contributions happen and then interest accrues or vice versa. 
        // Let's assume contribution at start of month, interest at end).



        // Add monthly contribution to totals before interest? 
        // Or contribute, then wait a month?
        // Standard formula: FV = P(1+r)^t + PMT * ...
        // Iterative approach:

        // Method: End of Period (Interest THEN Contribution)
        // This matches standard market calculators (like Investidor10)

        // Accrue interest on existing balance first
        currentTotal = currentTotal * (1 + rateMonthly);
        currentRealTotal = currentRealTotal * (1 + realRateMonthly);

        // Then add monthly contribution
        currentInvested += monthly;
        currentTotal += monthly;
        currentRealTotal += monthly;

        // Record yearly (or at end)
        if (i % 12 === 0) {
            results.push({
                year: i / 12,
                invested: Number(currentInvested.toFixed(2)),
                total: Number(currentTotal.toFixed(2)),
                interest: Number((currentTotal - currentInvested).toFixed(2)),
                realTotal: Number(currentRealTotal.toFixed(2))
            });
        }
    }

    return results;
};
