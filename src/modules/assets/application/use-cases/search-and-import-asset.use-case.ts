import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { BrapiService } from '../../../market-data/services/brapi.service';

@Injectable()
export class SearchAndImportAssetUseCase {
    private readonly logger = new Logger(SearchAndImportAssetUseCase.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly brapi: BrapiService,
    ) { }

    async execute(ticker: string) {
        this.logger.log(`Searching and importing asset: ${ticker}`);

        // 1. Check if already exists
        const existing = await this.prisma.asset.findUnique({
            where: { ticker: ticker.toUpperCase() },
        });

        if (existing) {
            this.logger.log(`Asset ${ticker} already exists`);
            return existing;
        }

        // 2. Search in Brapi
        const quote = await this.brapi.getQuote(ticker.toUpperCase());

        if (!quote) {
            throw new NotFoundException(`Asset ${ticker} not found`);
        }

        // 3. Import asset
        const indicators = this.brapi.mapQuoteToIndicators(quote);

        const asset = await this.prisma.asset.create({
            data: {
                ticker: ticker.toUpperCase(),
                name: quote.symbol,
                type: 'STOCK',
                sector: quote.summaryProfile?.sector || null,
                ...indicators,
                lastUpdated: new Date(),
            },
        });

        this.logger.log(`Asset ${ticker} imported successfully`);

        return asset;
    }
}
