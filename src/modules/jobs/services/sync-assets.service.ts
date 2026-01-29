import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { BrapiService } from '../../market-data/services/brapi.service';

export interface SyncResult {
    total: number;
    updated: number;
    failed: number;
    errors: Array<{ ticker: string; error: string }>;
}

@Injectable()
export class SyncAssetsService {
    private readonly logger = new Logger(SyncAssetsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly brapiService: BrapiService,
    ) { }

    async syncAll(): Promise<SyncResult> {
        this.logger.log('Starting asset synchronization...');

        const startTime = Date.now();
        const result: SyncResult = {
            total: 0,
            updated: 0,
            failed: 0,
            errors: [],
        };

        try {
            // Buscar todos os ativos
            const assets = await this.prisma.asset.findMany({
                select: { id: true, ticker: true },
            });

            result.total = assets.length;
            this.logger.log(`Found ${result.total} assets to sync`);

            if (assets.length === 0) {
                this.logger.warn('No assets found to sync');
                return result;
            }

            // Processar em lotes de 10 para respeitar rate limit
            const batchSize = 10;
            for (let i = 0; i < assets.length; i += batchSize) {
                const batch = assets.slice(i, i + batchSize);
                const tickers = batch.map(a => a.ticker);

                try {
                    // Buscar cotações na Brapi
                    const quotes = await this.brapiService.getQuotes(tickers);

                    // Atualizar cada ativo
                    for (const asset of batch) {
                        const quote = quotes.find(q => q.symbol === asset.ticker);

                        if (!quote) {
                            result.failed++;
                            result.errors.push({
                                ticker: asset.ticker,
                                error: 'Quote not found in Brapi response',
                            });
                            continue;
                        }

                        try {
                            const indicators = this.brapiService.mapQuoteToIndicators(quote);

                            await this.prisma.asset.update({
                                where: { id: asset.id },
                                data: indicators,
                            });

                            result.updated++;
                            this.logger.debug(`Updated ${asset.ticker}: R$ ${indicators.currentPrice}`);
                        } catch (error) {
                            result.failed++;
                            result.errors.push({
                                ticker: asset.ticker,
                                error: error.message,
                            });
                        }
                    }

                    // Aguardar 1 segundo entre lotes para respeitar rate limit
                    if (i + batchSize < assets.length) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                } catch (error) {
                    this.logger.error(`Error processing batch: ${error.message}`);
                    result.failed += batch.length;
                    batch.forEach(asset => {
                        result.errors.push({
                            ticker: asset.ticker,
                            error: `Batch error: ${error.message}`,
                        });
                    });
                }
            }

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            this.logger.log(
                `Sync completed in ${duration}s: ${result.updated} updated, ${result.failed} failed`,
            );

            return result;
        } catch (error) {
            this.logger.error(`Fatal error during sync: ${error.message}`);
            throw error;
        }
    }
}
