import { AssetEntity } from '../../domain/entities/asset.entity';
import { AssetType } from '../../domain/enums/asset-type.enum';

export interface AssetFilters {
    type?: AssetType;
    sector?: string;
    search?: string;
}

export interface UpdateIndicatorsData {
    currentPrice?: number;
    dividendYield?: number;
    priceToEarnings?: number;
    priceToBook?: number;
    roe?: number;
    netMargin?: number;
    debtToEquity?: number;
}

/**
 * Asset Repository Interface
 * Defines contract for Asset data access operations
 * Application layer depends on this interface, not on concrete implementations
 */
export interface IAssetRepository {
    findById(id: string): Promise<AssetEntity | null>;
    findByTicker(ticker: string): Promise<AssetEntity | null>;
    findAll(page: number, limit: number, filters?: AssetFilters): Promise<AssetEntity[]>;
    findByType(type: AssetType): Promise<AssetEntity[]>;
    findBySector(sector: string): Promise<AssetEntity[]>;
    create(data: { ticker: string; name: string; type: string; sector?: string }): Promise<AssetEntity>;
    update(id: string, data: { ticker?: string; name?: string; type?: string; sector?: string }): Promise<AssetEntity>;
    updateIndicators(id: string, indicators: UpdateIndicatorsData): Promise<AssetEntity>;
    delete(id: string): Promise<void>;
    count(filters?: AssetFilters): Promise<number>;
}
