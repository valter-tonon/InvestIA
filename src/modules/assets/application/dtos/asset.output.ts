import { AssetType } from '../../domain/enums/asset-type.enum';

export class AssetOutput {
    id: string;
    ticker: string;
    name: string;
    type: AssetType;
    sector: string | null;

    currentPrice: number | null;
    dividendYield: number | null;
    priceToEarnings: number | null;
    priceToBook: number | null;
    roe: number | null;
    netMargin: number | null;
    debtToEquity: number | null;
    lastUpdated: Date | null;

    createdAt: Date;
    updatedAt: Date;

    static fromEntity(asset: {
        id: string;
        ticker: string;
        name: string;
        type: string;
        sector: string | null;
        currentPrice: number | null;
        dividendYield: number | null;
        priceToEarnings: number | null;
        priceToBook: number | null;
        roe: number | null;
        netMargin: number | null;
        debtToEquity: number | null;
        lastUpdated: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }): AssetOutput {
        const output = new AssetOutput();
        output.id = asset.id;
        output.ticker = asset.ticker;
        output.name = asset.name;
        output.type = asset.type as AssetType;
        output.sector = asset.sector;
        output.currentPrice = asset.currentPrice;
        output.dividendYield = asset.dividendYield;
        output.priceToEarnings = asset.priceToEarnings;
        output.priceToBook = asset.priceToBook;
        output.roe = asset.roe;
        output.netMargin = asset.netMargin;
        output.debtToEquity = asset.debtToEquity;
        output.lastUpdated = asset.lastUpdated;
        output.createdAt = asset.createdAt;
        output.updatedAt = asset.updatedAt;
        return output;
    }
}
