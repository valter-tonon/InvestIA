import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { CalculateScoreService, ScoreResult } from '../../domain/services/calculate-score.service';

export enum RankingStrategy {
    GRAHAM = 'GRAHAM',
    BAZIN = 'BAZIN',
    BARSI = 'BARSI',
    COMPOSITE = 'COMPOSITE',
}

export interface RankedAsset {
    id: string;
    ticker: string;
    currentPrice: number;
    sector: string;
    scores: ScoreResult;
    rank: number;
}

@Injectable()
export class RankAssetsUseCase {
    private readonly logger = new Logger(RankAssetsUseCase.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly calculator: CalculateScoreService,
    ) { }

    async execute(options: {
        strategy: RankingStrategy;
        limit?: number;
        minLiquidity?: number; // Not used yet, placeholder for future
    }): Promise<RankedAsset[]> {

        // 1. Fetch Assets with Indicators and Dividends
        // Optimize selection to avoid fetching heavy unrelated fields
        const assets = await this.prisma.asset.findMany({
            where: {
                type: 'STOCK', // Ranking makes most sense for stocks
                currentPrice: { gt: 0 }, // Skip assets with no price
            },
            select: {
                id: true,
                ticker: true,
                type: true,
                sector: true,
                currentPrice: true,
                priceToEarnings: true,
                priceToBook: true,
                roe: true,
                dividends: {
                    select: { paymentDate: true, value: true },
                    orderBy: { paymentDate: 'desc' },
                },
            },
        });

        this.logger.log(`Ranking ${assets.length} assets using strategy ${options.strategy}`);

        // 2. Calculate Scores
        const ranked: RankedAsset[] = [];

        for (const asset of assets) {
            const scores = this.calculator.calculate({
                ...asset,
                currentPrice: Number(asset.currentPrice),
                priceToEarnings: Number(asset.priceToEarnings),
                priceToBook: Number(asset.priceToBook),
                roe: Number(asset.roe),
                dividends: asset.dividends.map(d => ({
                    ...d,
                    value: Number(d.value)
                }))
            });

            // Filter out assets that failed calculation (score -1)
            // or we keep them at bottom. Let's keep them if they have at least one valid metric?
            // For now, if composite is -1, it means we lack data.
            if (scores.compositeScore === -1) continue;

            ranked.push({
                id: asset.id,
                ticker: asset.ticker,
                currentPrice: Number(asset.currentPrice),
                sector: asset.sector || 'Desconhecido',
                scores,
                rank: 0, // Assigned later
            });
        }

        // 3. Sort
        ranked.sort((a, b) => {
            let scoreA = 0;
            let scoreB = 0;

            switch (options.strategy) {
                case RankingStrategy.GRAHAM:
                    scoreA = a.scores.grahamUpside;
                    scoreB = b.scores.grahamUpside;
                    break;
                case RankingStrategy.BAZIN:
                    scoreA = a.scores.bazinUpside;
                    scoreB = b.scores.bazinUpside;
                    break;
                case RankingStrategy.BARSI:
                    scoreA = a.scores.barsiUpside;
                    scoreB = b.scores.barsiUpside;
                    break;
                case RankingStrategy.COMPOSITE:
                default:
                    scoreA = a.scores.compositeScore;
                    scoreB = b.scores.compositeScore;
                    break;
            }

            return scoreB - scoreA; // Descending (High Upside is better)
        });

        // 4. Assign Rank and Slice
        const limit = options.limit || 50;
        const result = ranked.slice(0, limit).map((item, index) => ({
            ...item,
            rank: index + 1,
        }));

        return result;
    }
}
