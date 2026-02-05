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
    scores: {
        grahamUpside: number;
        bazinUpside: number;
        barsiUpside: number;
        compositeScore: number;
    };
    rank: number;
}
