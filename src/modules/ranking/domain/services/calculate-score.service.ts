import { Injectable } from '@nestjs/common';

export interface AssetWithIndicators {
    id: string;
    ticker: string;
    type: string;
    currentPrice: number | null;
    priceToEarnings: number | null;
    priceToBook: number | null;
    roe: number | null;
    dividends: Array<{ paymentDate: Date; value: number | string | any }>;
}

export interface ScoreResult {
    grahamUpside: number;
    bazinUpside: number;
    barsiUpside: number;
    compositeScore: number;
}

@Injectable()
export class CalculateScoreService {
    calculate(asset: AssetWithIndicators): ScoreResult {
        const currentPrice = Number(asset.currentPrice) || 0;
        if (currentPrice <= 0) {
            return { grahamUpside: -1, bazinUpside: -1, barsiUpside: -1, compositeScore: -1 };
        }

        const currentYear = new Date().getFullYear();

        const grahamPrice = this.calculateGraham(asset);
        const bazinPrice = this.calculateBazin(asset.dividends, currentYear);
        const barsiPrice = this.calculateBarsi(asset.dividends, currentYear);

        // Upside = (FairPrice / CurrentPrice) - 1
        // Example: Fair=20, Current=10 -> Upside = 1 (100%)
        // Example: Fair=5, Current=10 -> Upside = -0.5 (-50%)

        const grahamUpside = grahamPrice > 0 ? (grahamPrice / currentPrice) - 1 : -1;
        const bazinUpside = bazinPrice > 0 ? (bazinPrice / currentPrice) - 1 : -1;
        const barsiUpside = barsiPrice > 0 ? (barsiPrice / currentPrice) - 1 : -1;

        // Composite Score: Weighted Average
        // We prioritize consistent dividends (Barsi) and strictly safe dividend yield (Bazin)
        // Graham often gives high values for distorted P/E, so lower weight
        let score = 0;
        let weights = 0;

        if (grahamUpside > -1) { score += grahamUpside * 0.2; weights += 0.2; }
        if (bazinUpside > -1) { score += bazinUpside * 0.4; weights += 0.4; }
        if (barsiUpside > -1) { score += barsiUpside * 0.4; weights += 0.4; }

        if (weights === 0) return { grahamUpside: -1, bazinUpside: -1, barsiUpside: -1, compositeScore: -1 };

        return {
            grahamUpside,
            bazinUpside,
            barsiUpside,
            compositeScore: score / weights,
        };
    }

    private calculateGraham(asset: AssetWithIndicators): number {
        const pe = Number(asset.priceToEarnings);
        const pb = Number(asset.priceToBook);

        if (!pe || !pb || pe <= 0 || pb <= 0) return 0;

        // Formula Classic: Fair Price = SquareRoot(22.5 * LPA * VPA)
        // We have PE = Price/LPA -> LPA = Price/PE
        // We have PB = Price/VPA -> VPA = Price/PB
        // Fair Price = Sqrt(22.5 * (P/PE) * (P/PB))
        // Fair Price = Sqrt(22.5 * P^2 / (PE * PB))
        // Fair Price = P * Sqrt(22.5 / (PE * PB))

        const currentPrice = Number(asset.currentPrice);
        if (!currentPrice) return 0;

        try {
            const val = 22.5 / (pe * pb);
            if (val < 0) return 0; // Impossible unless PE*PB negative
            return currentPrice * Math.sqrt(val);
        } catch {
            return 0;
        }
    }

    private calculateBazin(dividends: any[], currentYear: number): number {
        const lastYear = currentYear - 1;
        // Check if value is string or decimal
        const lastYearDividends = dividends
            .filter((d) => new Date(d.paymentDate).getFullYear() === lastYear)
            .reduce((sum, d) => sum + Number(d.value), 0);

        if (lastYearDividends <= 0) return 0;

        // Fair Price = Dividend / 6%
        return lastYearDividends / 0.06;
    }

    private calculateBarsi(dividends: any[], currentYear: number): number {
        const fiveYearsAgo = currentYear - 5;
        const recentDividends = dividends.filter(
            (d) => new Date(d.paymentDate).getFullYear() >= fiveYearsAgo,
        );

        if (recentDividends.length === 0) return 0;

        const yearlyTotals: Record<number, number> = {};
        recentDividends.forEach((d) => {
            const year = new Date(d.paymentDate).getFullYear();
            yearlyTotals[year] = (yearlyTotals[year] || 0) + Number(d.value);
        });

        const years = Object.keys(yearlyTotals).length; // Only count years with dividends? Or strict 5?
        // Barsi usually implies strict average over period. If paid 0 in a year, it drags avg down.
        // Let's assume strict 5 years divisor if we have data spanning 5 years?
        // For safety, let's use max(yearsFound, 1) or just 5?
        // Let's use count of years with dividends for now to be "fair" to recent IPOs, 
        // but technically Barsi penalizes gaps.
        // Reusing FairPriceLogic: avgDividend = totalDividends / years

        if (years === 0) return 0;

        const totalDividends = Object.values(yearlyTotals).reduce((a, b) => a + b, 0);
        return (totalDividends / years) / 0.06;
    }
}
