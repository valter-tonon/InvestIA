import { AssetType } from '../enums/asset-type.enum';

export interface AssetIndicators {
    currentPrice?: number;
    dividendYield?: number;
    priceToEarnings?: number;
    priceToBook?: number;
    roe?: number;
    netMargin?: number;
    debtToEquity?: number;
    lastUpdated?: Date;
}

export class AssetEntity {
    id: string;
    ticker: string;
    name: string;
    type: AssetType;
    sector: string | null;

    // Indicadores financeiros
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

    constructor(props: Partial<AssetEntity>) {
        Object.assign(this, props);
    }

    static create(
        ticker: string,
        name: string,
        type: AssetType,
        sector?: string,
    ): AssetEntity {
        if (!ticker || ticker.length < 4) {
            throw new Error('Ticker inválido');
        }

        if (!name || name.length < 2) {
            throw new Error('Nome inválido');
        }

        return new AssetEntity({
            ticker: ticker.toUpperCase(),
            name,
            type,
            sector: sector || null,
            currentPrice: null,
            dividendYield: null,
            priceToEarnings: null,
            priceToBook: null,
            roe: null,
            netMargin: null,
            debtToEquity: null,
            lastUpdated: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    updateIndicators(indicators: AssetIndicators): void {
        if (indicators.currentPrice !== undefined) {
            this.currentPrice = indicators.currentPrice;
        }
        if (indicators.dividendYield !== undefined) {
            this.dividendYield = indicators.dividendYield;
        }
        if (indicators.priceToEarnings !== undefined) {
            this.priceToEarnings = indicators.priceToEarnings;
        }
        if (indicators.priceToBook !== undefined) {
            this.priceToBook = indicators.priceToBook;
        }
        if (indicators.roe !== undefined) {
            this.roe = indicators.roe;
        }
        if (indicators.netMargin !== undefined) {
            this.netMargin = indicators.netMargin;
        }
        if (indicators.debtToEquity !== undefined) {
            this.debtToEquity = indicators.debtToEquity;
        }
        this.lastUpdated = new Date();
        this.updatedAt = new Date();
    }
}
