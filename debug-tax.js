const IOF_TABLE = [
    96, 93, 90, 86, 83, 80, 76, 73, 70, 66,
    63, 60, 56, 53, 50, 46, 43, 40, 36, 33,
    30, 26, 23, 20, 16, 13, 10, 6, 3
];

const getIOFRate = (days) => {
    if (days <= 0) return 0;
    if (days >= 30) return 0;
    return IOF_TABLE[days - 1] || 0;
};

const getIRRate = (days, type) => {
    if (['LCI', 'LCA'].includes(type)) return 0;
    if (days <= 180) return 22.5;
    if (days <= 360) return 20.0;
    if (days <= 720) return 17.5;
    return 15.0;
};

const calculate = (amount, days, type, indicators) => {
    // Basic yield simulation (simplified)
    const annualRate = 0.10; // 10% a.a. sim
    const timeInYears = days / 365;
    const grossTotal = amount * Math.pow(1 + annualRate, timeInYears);
    const grossYield = grossTotal - amount;

    const iofRate = getIOFRate(days);
    const irRate = getIRRate(days, type);

    // IOF logic
    // IOF only applies to taxable? Or all?
    // Generally IOF applies to all if redeemed < 30 days, BUT LCI has lockup.
    // Let's assume IOF applies if applicable.
    const iofTax = grossYield * (iofRate / 100);

    // IR Base is Yield - IOF
    const taxableBase = Math.max(0, grossYield - iofTax);
    const irTax = taxableBase * (irRate / 100);

    const netYield = grossYield - iofTax - irTax;
    const netTotal = amount + netYield;

    console.log(`\nSimulating ${type} for ${days} days:`);
    console.log(`  Yield: ${grossYield.toFixed(2)}`);
    console.log(`  IOF (${iofRate}%): ${iofTax.toFixed(2)}`);
    console.log(`  IR (${irRate}%): ${irTax.toFixed(2)}`);
    console.log(`  Net: ${netTotal.toFixed(2)}`);
};

calculate(1000, 20, 'CDB', {}); // Expect IOF + IR
calculate(1000, 30, 'CDB', {}); // Expect 0 IOF, 22.5% IR
calculate(1000, 400, 'CDB', {}); // Expect 0 IOF, 17.5% IR
calculate(1000, 400, 'LCI', {}); // Expect 0 IOF, 0% IR
