export type AssetType = 'STOCK' | 'REIT' | 'ETF' | 'BDR' | 'CRYPTO';

export interface Asset {
    id: string;
    ticker: string;
    name: string;
    type: AssetType;
    sector?: string;
    currentPrice?: number;
    targetPrice?: number;
    dividendYield?: number;
    peRatio?: number;
    roe?: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAssetInput {
    ticker: string;
    name: string;
    type: AssetType;
    sector?: string;
    targetPrice?: number;
}

export interface UpdateAssetInput extends Partial<CreateAssetInput> {
    currentPrice?: number;
    dividendYield?: number;
    peRatio?: number;
    roe?: number;
}

export interface AssetFilters {
    type?: AssetType;
    sector?: string;
    search?: string;
    page?: number;
    perPage?: number;
}

export interface PaginatedResult<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        perPage: number;
        lastPage: number;
    };
}
