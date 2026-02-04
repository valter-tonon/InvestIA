export type AssetType = 'CDB' | 'LC' | 'TESOURO' | 'DEBENTURE' | 'LCI' | 'LCA' | 'CRI' | 'CRA' | 'DEBENTURE_INC';

export type IndexerType = 'CDI' | 'IPCA' | 'PRE';

export type ContributionIncreaseType = 'percentage' | 'fixed' | 'none';

export interface FixedIncomeResult {
    grossTotal: number;
    netTotal: number;
    invested: number;
    grossYield: number;
    netYield: number;
    totalTax: number;
    irTax: number;
    iofTax: number;
    days: number;
    irRate: number;
    iofRate: number;
    monthlyEquivalent: number;
    annualEquivalent: number;
}

export interface ContributionConfig {
    enabled: boolean;
    amount: number;                      // R$ por aporte
    frequencyMonths: number;             // A cada X meses
    increaseType: ContributionIncreaseType;
    increaseAmount: number;              // % ou R$
    increaseFrequencyMonths: number;     // A cada X meses
}

export interface FixedIncomeResultWithContributions extends FixedIncomeResult {
    contributionCount: number;
    averageIRRate: number;               // IR médio ponderado
    averageHoldingPeriod: number;        // Dias médios ponderados
}

// IOF Table (Day 1 to 29). Day 30+ is 0%.
// Index 0 = 1 day, Index 28 = 29 days.
const IOF_TABLE = [
    96, 93, 90, 86, 83, 80, 76, 73, 70, 66,
    63, 60, 56, 53, 50, 46, 43, 40, 36, 33,
    30, 26, 23, 20, 16, 13, 10, 6, 3
];

export const getIOFRate = (days: number): number => {
    if (days <= 0) return 0;
    if (days >= 30) return 0;
    return IOF_TABLE[days - 1] || 0;
};

export const getIRRate = (days: number, type: AssetType): number => {
    // Exempt Assets
    if (['LCI', 'LCA', 'CRI', 'CRA', 'DEBENTURE_INC'].includes(type)) {
        return 0;
    }

    // Regressive Table
    if (days <= 180) return 22.5;
    if (days <= 360) return 20.0;
    if (days <= 720) return 17.5;
    return 15.0;
};

export const calculateFixedIncome = (
    amount: number,
    days: number,
    assetType: AssetType,
    indexer: IndexerType,
    rate: number, // e.g., 100 (% of CDI), 10 (% Pre), 5 (% + IPCA)
    indicators: { cdi: number; ipca: number; }
): FixedIncomeResult => {
    // 1. Calculate Annual Effective Rate
    let annualRate = 0;

    if (indexer === 'PRE') {
        annualRate = rate / 100;
    } else if (indexer === 'CDI') {
        const cdiDecimal = indicators.cdi / 100;
        annualRate = cdiDecimal * (rate / 100);
    } else if (indexer === 'IPCA') {
        const ipcaDecimal = indicators.ipca / 100;
        const fixedDecimal = rate / 100;
        // Fisher Equation: (1 + real)(1 + inflation) - 1
        annualRate = (1 + fixedDecimal) * (1 + ipcaDecimal) - 1;
    }

    // 2. Convert to Daily Rate (Business days usually 252, but simplified to 360 or 365 
    // for general comparison. Using 252 business days approx or 360 calendar. 
    // Let's use 360 calendar days for simplicity in public simulators unless strict).
    // Standard CDB is exponential business days (252).
    // Let's approximate days/360 exponential.
    const timeInYears = days / 365;

    // Compound Interest: M = P * (1 + r)^t
    const grossTotal = amount * Math.pow(1 + annualRate, timeInYears);
    const grossYield = grossTotal - amount;

    // 3. Tax Calculation
    const iofRate = getIOFRate(days);
    const irRate = getIRRate(days, assetType);

    const iofTax = grossYield * (iofRate / 100);
    const taxableBase = grossYield - iofTax; // IR is over (Yield - IOF)
    const irTax = taxableBase * (irRate / 100);

    const totalTax = iofTax + irTax;
    const netYield = grossYield - totalTax;
    const netTotal = amount + netYield;

    // 4. Equivalent Rates
    // What monthly rate gives this net yield?
    const monthlyEquivalent = (Math.pow(netTotal / amount, 1 / (days / 30)) - 1) * 100;
    const annualEquivalent = (Math.pow(netTotal / amount, 1 / timeInYears) - 1) * 100;

    return {
        grossTotal,
        netTotal,
        invested: amount,
        grossYield,
        netYield,
        totalTax,
        irTax,
        iofTax,
        days,
        irRate,
        iofRate,
        monthlyEquivalent,
        annualEquivalent
    };
};

export const calculateFixedIncomeWithContributions = (
    initialAmount: number,
    days: number,
    contributionConfig: ContributionConfig,
    assetType: AssetType,
    indexer: IndexerType,
    rate: number,
    indicators: { cdi: number; ipca: number; }
): FixedIncomeResultWithContributions => {
    // If contributions disabled, calculate single amount
    if (!contributionConfig.enabled) {
        const baseResult = calculateFixedIncome(
            initialAmount,
            days,
            assetType,
            indexer,
            rate,
            indicators
        );
        return {
            ...baseResult,
            contributionCount: 1,
            averageIRRate: baseResult.irRate,
            averageHoldingPeriod: days
        };
    }

    // 1. Calculate annual rate (same as single calculation)
    let annualRate = 0;

    if (indexer === 'PRE') {
        annualRate = rate / 100;
    } else if (indexer === 'CDI') {
        const cdiDecimal = indicators.cdi / 100;
        annualRate = cdiDecimal * (rate / 100);
    } else if (indexer === 'IPCA') {
        const ipcaDecimal = indicators.ipca / 100;
        const fixedDecimal = rate / 100;
        annualRate = (1 + fixedDecimal) * (1 + ipcaDecimal) - 1;
    }

    // 2. Build contribution schedule
    interface Contribution {
        amount: number;
        daysHeld: number;
        month: number;
    }

    const contributions: Contribution[] = [];

    // Initial contribution (month 0)
    contributions.push({
        amount: initialAmount,
        daysHeld: days,
        month: 0
    });

    // Generate recurring contributions month by month
    let currentContribution = contributionConfig.amount;
    const totalMonths = Math.ceil(days / 30);

    for (let month = 1; month <= totalMonths; month++) {
        // Apply increase before adding contribution
        if (
            contributionConfig.increaseType !== 'none' &&
            month % contributionConfig.increaseFrequencyMonths === 0
        ) {
            if (contributionConfig.increaseType === 'percentage') {
                currentContribution *= (1 + contributionConfig.increaseAmount / 100);
            } else if (contributionConfig.increaseType === 'fixed') {
                currentContribution += contributionConfig.increaseAmount;
            }
        }

        // Add contribution if frequency matches
        if (month % contributionConfig.frequencyMonths === 0) {
            const daysRemaining = days - (month * 30);
            if (daysRemaining > 0) {
                contributions.push({
                    amount: currentContribution,
                    daysHeld: daysRemaining,
                    month
                });
            }
        }
    }

    // 3. Calculate growth and taxes for each contribution
    let grossTotal = 0;
    let totalInvested = 0;
    let totalIRTax = 0;
    let totalIOFTax = 0;
    let totalIRRateWeighted = 0;
    let totalDaysWeighted = 0;

    for (const contrib of contributions) {
        // Calculate growth for this contribution
        const timeInYears = contrib.daysHeld / 365;
        const grossValue = contrib.amount * Math.pow(1 + annualRate, timeInYears);
        const grossYield = grossValue - contrib.amount;

        // Calculate taxes for this contribution (cascading)
        const iofRate = getIOFRate(contrib.daysHeld);
        const irRate = getIRRate(contrib.daysHeld, assetType);

        const iofTax = grossYield * (iofRate / 100);
        const taxableBase = grossYield - iofTax;
        const irTax = taxableBase * (irRate / 100);

        // Accumulate
        grossTotal += grossValue;
        totalInvested += contrib.amount;
        totalIOFTax += iofTax;
        totalIRTax += irTax;

        // Weighted averages
        totalIRRateWeighted += irRate * contrib.amount;
        totalDaysWeighted += contrib.daysHeld * contrib.amount;
    }

    const netTotal = grossTotal - totalIOFTax - totalIRTax;
    const grossYield = grossTotal - totalInvested;
    const netYield = grossYield - totalIOFTax - totalIRTax;

    // Calculate weighted averages
    const averageIRRate = totalInvested > 0 ? totalIRRateWeighted / totalInvested : 0;
    const averageHoldingPeriod = totalInvested > 0 ? totalDaysWeighted / totalInvested : 0;

    // Equivalent rates (using the overall result, not per contribution)
    const monthlyEquivalent =
        netTotal > 0 ? (Math.pow(netTotal / totalInvested, 1 / (days / 30)) - 1) * 100 : 0;
    const annualEquivalent =
        netTotal > 0 ? (Math.pow(netTotal / totalInvested, 1 / (days / 365)) - 1) * 100 : 0;

    return {
        grossTotal,
        netTotal,
        invested: totalInvested,
        grossYield,
        netYield,
        totalTax: totalIOFTax + totalIRTax,
        irTax: totalIRTax,
        iofTax: totalIOFTax,
        days,
        irRate: averageIRRate,
        iofRate: totalIOFTax > 0 ? (totalIOFTax / grossYield) * 100 : 0,
        monthlyEquivalent,
        annualEquivalent,
        contributionCount: contributions.length,
        averageIRRate,
        averageHoldingPeriod
    };
};
