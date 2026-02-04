import type { RankingStrategy } from './ranking';

export interface RankedAsset {
    id: string;
    ticker: string;
    currentPrice: number;
    sector: string;
    scores: {
        grahamUpside: number;
        bazinUpside: number;
        barsiUpside: number;
        compositeScore: number;
    };
    rank: number;
}

export { RankingStrategy };
