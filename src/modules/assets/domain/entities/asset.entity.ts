import { BadRequestException } from '@nestjs/common';
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
        // ERR-001: Use BadRequestException instead of generic Error
        if (!ticker || ticker.length < 4) {
            throw new BadRequestException('Ticker inválido');
        }

        if (!name || name.length < 2) {
            throw new BadRequestException('Nome inválido');
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

    // ARCH-001: Factory method to convert Prisma model to domain entity
    static fromPrisma(prismaAsset: any): AssetEntity {
        return new AssetEntity({
            id: prismaAsset.id,
            ticker: prismaAsset.ticker,
            name: prismaAsset.name,
            type: prismaAsset.type as AssetType,
            sector: prismaAsset.sector,
            currentPrice: prismaAsset.currentPrice ? Number(prismaAsset.currentPrice) : null,
            dividendYield: prismaAsset.dividendYield ? Number(prismaAsset.dividendYield) : null,
            priceToEarnings: prismaAsset.priceToEarnings ? Number(prismaAsset.priceToEarnings) : null,
            priceToBook: prismaAsset.priceToBook ? Number(prismaAsset.priceToBook) : null,
            roe: prismaAsset.roe ? Number(prismaAsset.roe) : null,
            netMargin: prismaAsset.netMargin ? Number(prismaAsset.netMargin) : null,
            debtToEquity: prismaAsset.debtToEquity ? Number(prismaAsset.debtToEquity) : null,
            lastUpdated: prismaAsset.lastUpdated,
            createdAt: prismaAsset.createdAt,
            updatedAt: prismaAsset.updatedAt,
        });
    }
}
