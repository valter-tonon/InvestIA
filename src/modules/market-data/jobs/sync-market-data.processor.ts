import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../../infrastructure/database';
import { MarketDataService } from '../services/market-data.service';

export const SYNC_MARKET_DATA_QUEUE = 'sync-market-data';

export interface SyncMarketDataJobPayload {
    tickers?: string[];
    syncAll?: boolean;
}

@Processor(SYNC_MARKET_DATA_QUEUE)
export class SyncMarketDataProcessor extends WorkerHost {
    private readonly logger = new Logger(SyncMarketDataProcessor.name);

    constructor(
        private readonly marketDataService: MarketDataService,
        private readonly prisma: PrismaService,
    ) {
        super();
    }

    async process(job: Job<SyncMarketDataJobPayload>): Promise<void> {
        this.logger.log(`Iniciando sync de mercado - Job ID: ${job.id}`);

        const { tickers, syncAll } = job.data;
        let tickersToSync: string[];

        if (syncAll || !tickers?.length) {
            // Busca todos os tickers cadastrados no banco
            const assets = await this.prisma.asset.findMany({
                select: { ticker: true },
            });
            tickersToSync = assets.map((a) => a.ticker);
        } else {
            tickersToSync = tickers;
        }

        this.logger.log(`Sincronizando ${tickersToSync.length} ativos`);

        for (const ticker of tickersToSync) {
            try {
                const quote = await this.marketDataService.fetchQuote(ticker);

                if (quote) {
                    await this.prisma.asset.update({
                        where: { ticker },
                        data: {
                            currentPrice: quote.regularMarketPrice,
                            dividendYield: quote.dividendYield,
                            priceToEarnings: quote.priceEarnings,
                            priceToBook: quote.priceToBook,
                            roe: quote.roe,
                            netMargin: quote.netMargin,
                            debtToEquity: quote.debtEquity,
                            lastUpdated: new Date(),
                        },
                    });
                    this.logger.debug(`Atualizado: ${ticker}`);
                }

                // Atualiza progresso
                await job.updateProgress(
                    Math.round(
                        ((tickersToSync.indexOf(ticker) + 1) / tickersToSync.length) * 100,
                    ),
                );
            } catch (error) {
                this.logger.error(`Erro ao sincronizar ${ticker}:`, error.message);
            }
        }

        this.logger.log(`Sync concluído - Job ID: ${job.id}`);
    }
}
