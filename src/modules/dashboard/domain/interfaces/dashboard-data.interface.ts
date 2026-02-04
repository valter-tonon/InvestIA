export interface DashboardSummary {
    totalAssets: number;
    totalValue: number;
    totalChange: number;
    topGainer?: {
        ticker: string;
        change: number;
    };
    topLoser?: {
        ticker: string;
        change: number;
    };
}

export interface PerformanceDataPoint {
    date: string;
    value: number;
    change: number;
}

export interface SectorDistribution {
    sector: string;
    value: number;
    percentage: number;
    count: number;
}

export interface TopAsset {
    ticker: string;
    name: string;
    value: number;
    change: number;
    percentage: number;
}
