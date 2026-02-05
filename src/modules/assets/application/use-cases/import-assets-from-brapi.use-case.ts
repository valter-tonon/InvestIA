import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { BrapiService } from '../../../market-data/services/brapi.service';

interface ImportResult {
    created: number;
    updated: number;
    skipped: number;
    errors: number;
    details: Array<{ ticker: string; status: 'created' | 'updated' | 'skipped' | 'error'; message?: string }>;
}

@Injectable()
export class ImportAssetsFromBrapiUseCase {
    private readonly logger = new Logger(ImportAssetsFromBrapiUseCase.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly brapi: BrapiService,
    ) { }

    async execute(options?: {
        tickers?: string[];
        limit?: number;
        skipRecent?: boolean;
    }): Promise<ImportResult> {
        const result: ImportResult = {
            created: 0,
            updated: 0,
            skipped: 0,
            errors: 0,
            details: [],
        };

        try {
            // 1. Get list of tickers to import
            let tickersToImport: string[];

            if (options?.tickers) {
                tickersToImport = options.tickers;
            } else {
                // Get available assets from Brapi
                const available = await this.brapi.getAvailableAssets('stock');
                tickersToImport = options?.limit
                    ? available.slice(0, options.limit)
                    : available;
            }

            this.logger.log(`Starting import of ${tickersToImport.length} assets`);

            // 2. Process in batches of 10
            const batchSize = 10;
            for (let i = 0; i < tickersToImport.length; i += batchSize) {
                const batch = tickersToImport.slice(i, i + batchSize);

                await Promise.all(
                    batch.map(async (ticker) => {
                        try {
                            const importResult = await this.importSingleAsset(
                                ticker,
                                options?.skipRecent,
                            );
                            result[importResult.status]++;
                            result.details.push(importResult);
                        } catch (error) {
                            this.logger.error(`Failed to import ${ticker}: ${error.message}`);
                            result.errors++;
                            result.details.push({
                                ticker,
                                status: 'error',
                                message: error.message,
                            });
                        }
                    }),
                );

                // Rate limiting: wait 2s between batches
                if (i + batchSize < tickersToImport.length) {
                    await this.sleep(2000);
                }
            }

            this.logger.log(
                `Import completed: ${result.created} created, ${result.updated} updated, ${result.skipped} skipped, ${result.errors} errors`,
            );

            return result;
        } catch (error) {
            this.logger.error(`Import failed: ${error.message}`);
            throw error;
        }
    }

    private async importSingleAsset(
        ticker: string,
        skipRecent = true,
    ): Promise<{ ticker: string; status: 'created' | 'updated' | 'skipped'; message?: string }> {
        // Check if asset exists and needs update
        const existing = await this.prisma.asset.findUnique({
            where: { ticker },
        });

        if (existing && skipRecent) {
            const hoursSinceUpdate = existing.lastUpdated
                ? (Date.now() - existing.lastUpdated.getTime()) / (1000 * 60 * 60)
                : 999;

            if (hoursSinceUpdate < 24) {
                return {
                    ticker,
                    status: 'skipped',
                    message: `Updated ${Math.round(hoursSinceUpdate)}h ago`,
                };
            }
        }

        // Fetch data from Brapi
        const quote = await this.brapi.getQuote(ticker);

        if (!quote) {
            throw new Error(`Asset ${ticker} not found in Brapi`);
        }

        // Map Brapi data to our schema
        const indicators = this.brapi.mapQuoteToIndicators(quote);
        const assetData = {
            name: quote.symbol, // Brapi doesn't always have longName
            type: 'STOCK', // Default type
            sector: quote.summaryProfile?.sector || null,
            ...indicators,
            lastUpdated: new Date(),
        };

        // Upsert asset
        await this.prisma.asset.upsert({
            where: { ticker },
            update: assetData,
            create: {
                ticker,
                ...assetData,
            },
        });

        return {
            ticker,
            status: existing ? 'updated' : 'created',
        };
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
