import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { FairPriceResult } from '../../domain/interfaces/fair-price.interface';

@Injectable()
export class CalculateFairPriceUseCase {
    constructor(private readonly prisma: PrismaService) { }

    async execute(assetId: string): Promise<FairPriceResult> {
        // Get asset with dividends
        const asset = await this.prisma.asset.findUnique({
            where: { id: assetId },
            include: {
                dividends: {
                    orderBy: { paymentDate: 'desc' },
                },
            },
        });

        if (!asset) {
            throw new Error('Asset not found');
        }

        const currentYear = new Date().getFullYear();
        const currentPrice = asset.currentPrice ? Number(asset.currentPrice) : null;

        // Calculate Bazin (Conservador - último ano DY 6%)
        const bazinPrice = this.calculateBazin(asset.dividends, currentYear);

        // Calculate Barsi (Moderado - média 5 anos DY 6%)
        const barsiPrice = this.calculateBarsi(asset.dividends, currentYear);

        // Calculate Graham (Value - √(22.5 × LPA × VPA))
        const grahamPrice = this.calculateGraham(
            asset.priceToEarnings ? Number(asset.priceToEarnings) : null,
            asset.roe ? Number(asset.roe) : null,
        );

        const calculations = {
            bazin: {
                method: 'bazin' as const,
                price: bazinPrice,
                description: 'Conservador - DY 6% (último ano)',
            },
            barsi: {
                method: 'barsi' as const,
                price: barsiPrice,
                description: 'Moderado - DY 6% (média 5 anos)',
            },
            graham: {
                method: 'graham' as const,
                price: grahamPrice,
                description: 'Value - Fórmula de Graham',
            },
        };

        const prices = [bazinPrice, barsiPrice, grahamPrice].filter((p) => p > 0);
        const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const highestPrice = prices.length > 0 ? Math.max(...prices) : 0;

        // Calculate Yield on Cost
        const yieldOnCost = this.calculateYieldOnCost(
            asset.dividends,
            asset.averagePurchasePrice ? Number(asset.averagePurchasePrice) : null,
            currentYear,
        );

        // Recommendation logic
        let recommendation: 'COMPRA' | 'VENDA' | 'NEUTRO' = 'NEUTRO';
        if (currentPrice && lowestPrice > 0) {
            if (currentPrice < lowestPrice) {
                recommendation = 'COMPRA';
            } else if (currentPrice > highestPrice) {
                recommendation = 'VENDA';
            }
        }

        return {
            assetId: asset.id,
            ticker: asset.ticker,
            currentPrice,
            calculations,
            recommendation,
            lowestPrice,
            highestPrice,
            yieldOnCost,
            averagePurchasePrice: asset.averagePurchasePrice
                ? Number(asset.averagePurchasePrice)
                : null,
        };
    }

    private calculateBazin(dividends: any[], currentYear: number): number {
        // Sum dividends from last year
        const lastYear = currentYear - 1;
        const lastYearDividends = dividends
            .filter((d) => new Date(d.paymentDate).getFullYear() === lastYear)
            .reduce((sum, d) => sum + Number(d.value), 0);

        if (lastYearDividends === 0) return 0;

        // Preço Teto = Dividendo Anual / 0.06
        return lastYearDividends / 0.06;
    }

    private calculateBarsi(dividends: any[], currentYear: number): number {
        // Calculate average dividends from last 5 years
        const fiveYearsAgo = currentYear - 5;
        const recentDividends = dividends.filter(
            (d) => new Date(d.paymentDate).getFullYear() >= fiveYearsAgo,
        );

        if (recentDividends.length === 0) return 0;

        // Group by year
        const yearlyTotals: Record<number, number> = {};
        recentDividends.forEach((d) => {
            const year = new Date(d.paymentDate).getFullYear();
            yearlyTotals[year] = (yearlyTotals[year] || 0) + Number(d.value);
        });

        const years = Object.keys(yearlyTotals).length;
        if (years === 0) return 0;

        const totalDividends = Object.values(yearlyTotals).reduce(
            (sum, val) => sum + val,
            0,
        );
        const avgDividend = totalDividends / years;

        // Preço Teto = Média Dividendo Anual / 0.06
        return avgDividend / 0.06;
    }

    private calculateGraham(peRatio: number | null, roe: number | null): number {
        if (!peRatio || !roe || peRatio <= 0 || roe <= 0) return 0;

        // Simplified Graham: we need LPA and VPA
        // LPA = Price / P/L
        // VPA = (ROE / 100) * LPA (approximation)
        // For now, return 0 if we don't have enough data
        // TODO: Add LPA and VPA fields to Asset model
        return 0;
    }

    private calculateYieldOnCost(
        dividends: any[],
        averagePurchasePrice: number | null,
        currentYear: number,
    ): number | null {
        if (!averagePurchasePrice || averagePurchasePrice <= 0) return null;

        // Sum dividends from last year
        const lastYear = currentYear - 1;
        const lastYearDividends = dividends
            .filter((d) => new Date(d.paymentDate).getFullYear() === lastYear)
            .reduce((sum, d) => sum + Number(d.value), 0);

        if (lastYearDividends === 0) return 0;

        // YoC = (Dividendo Anual / Preço Médio de Compra) * 100
        return (lastYearDividends / averagePurchasePrice) * 100;
    }
}
