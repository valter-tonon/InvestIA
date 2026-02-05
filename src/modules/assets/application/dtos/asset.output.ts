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

    // DB-002: Accept Decimal from Prisma (will be Decimal type after migration)
    static fromEntity(asset: {
        id: string;
        ticker: string;
        name: string;
        type: string;
        sector: string | null;
        currentPrice: any; // Decimal | number | null
        dividendYield: any; // Decimal | number | null
        priceToEarnings: any; // Decimal | number | null
        priceToBook: any; // Decimal | number | null
        roe: any; // Decimal | number | null
        netMargin: any; // Decimal | number | null
        debtToEquity: any; // Decimal | number | null
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
        output.currentPrice = asset.currentPrice ? Number(asset.currentPrice) : null;
        output.dividendYield = asset.dividendYield ? Number(asset.dividendYield) : null;
        output.priceToEarnings = asset.priceToEarnings ? Number(asset.priceToEarnings) : null;
        output.priceToBook = asset.priceToBook ? Number(asset.priceToBook) : null;
        output.roe = asset.roe ? Number(asset.roe) : null;
        output.netMargin = asset.netMargin ? Number(asset.netMargin) : null;
        output.debtToEquity = asset.debtToEquity ? Number(asset.debtToEquity) : null;
        output.lastUpdated = asset.lastUpdated;
        output.createdAt = asset.createdAt;
        output.updatedAt = asset.updatedAt;
        return output;
    }
}
