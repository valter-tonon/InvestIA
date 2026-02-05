const calculateCompoundInterest = (
    initial,
    monthly,
    rateAnnual,
    years
) => {
    const months = years * 12;

    // 1. Compound Equivalence (Correct Finance)
    const rateMonthlyCompound = Math.pow(1 + rateAnnual / 100, 1 / 12) - 1;

    // 2. Simple Division (Common in Simple Calculators)
    const rateMonthlySimple = (rateAnnual / 100) / 12;

    console.log(`\n--- Simulation ---`);
    console.log(`Initial: ${initial}, Monthly: ${monthly}, Annual: ${rateAnnual}%, Years: ${years}`);
    console.log(`Rate Compound: ${(rateMonthlyCompound * 100).toFixed(6)}%`);
    console.log(`Rate Simple:   ${(rateMonthlySimple * 100).toFixed(6)}%`);

    const runSimulation = (rMonthly, name) => {
        let totalStart = initial;
        let totalEnd = initial;

        for (let i = 1; i <= months; i++) {
            // Start of Period: Deposit then Interest
            totalStart += monthly;
            totalStart = totalStart * (1 + rMonthly);

            // End of Period: Interest then Deposit
            totalEnd = totalEnd * (1 + rMonthly);
            totalEnd += monthly;
        }

        // Also Total Interest
        const invested = initial + (monthly * months);

        console.log(`\n[${name}]`);
        console.log(`  Start-Mode Total: ${totalStart.toFixed(2)} (Interest: ${(totalStart - invested).toFixed(2)})`);
        console.log(`  End-Mode Total:   ${totalEnd.toFixed(2)} (Interest: ${(totalEnd - invested).toFixed(2)})`);
    };

    runSimulation(rateMonthlyCompound, "Compound Equivalent Rate");
    runSimulation(rateMonthlySimple, "Simple Division Rate");
};

// User params: 5000, 500, 14.9%, 20y
calculateCompoundInterest(5000, 500, 14.9, 20);
