// Test script to run asset import directly
const { PrismaClient } = require('@prisma/client');

async function testImport() {
    const prisma = new PrismaClient();

    console.log('🚀 Starting asset import test...\n');

    try {
        // Simulate what the use case would do
        console.log('📡 Fetching available assets from Brapi...');

        const response = await fetch('https://brapi.dev/api/quote/list?type=stock');
        const data = await response.json();

        console.log(`✅ Found ${data.stocks?.length || 0} available stocks\n`);

        // Import first 5 as test
        const tickersToImport = data.stocks.slice(0, 5);
        console.log('📥 Importing first 5 assets:', tickersToImport.join(', '), '\n');

        for (const ticker of tickersToImport) {
            try {
                console.log(`  Processing ${ticker}...`);

                // Check if exists
                const existing = await prisma.asset.findUnique({
                    where: { ticker }
                });

                if (existing) {
                    console.log(`  ⏭️  ${ticker} already exists, skipping`);
                    continue;
                }

                // Fetch quote data
                const quoteResponse = await fetch(`https://brapi.dev/api/quote/${ticker}`);
                const quoteData = await quoteResponse.json();

                if (!quoteData.results || quoteData.results.length === 0) {
                    console.log(`  ❌ ${ticker} - No data from Brapi`);
                    continue;
                }

                const quote = quoteData.results[0];

                // Create asset
                await prisma.asset.create({
                    data: {
                        ticker: quote.symbol,
                        name: quote.longName || quote.shortName || quote.symbol,
                        type: 'STOCK',
                        currentPrice: quote.regularMarketPrice || 0,
                        sector: quote.sector || null,
                        // Market indicators
                        marketCap: quote.marketCap || null,
                        volume: quote.regularMarketVolume || null,
                        dividendYield: quote.dividendYield || null,
                        priceToEarnings: quote.priceEarnings || null,
                        priceToBook: quote.priceToBook || null,
                        returnOnEquity: quote.returnOnEquity || null,
                    }
                });

                console.log(`  ✅ ${ticker} imported successfully`);

                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));

            } catch (error) {
                console.log(`  ❌ ${ticker} - Error: ${error.message}`);
            }
        }

        console.log('\n✅ Import test completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testImport();
