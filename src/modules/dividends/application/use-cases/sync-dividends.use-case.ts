import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { BrapiService, BrapiDividend } from '../../../market-data/services/brapi.service';

@Injectable()
export class SyncDividendsUseCase {
    private readonly logger = new Logger(SyncDividendsUseCase.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly brapiService: BrapiService,
    ) { }

    async execute(ticker: string, years: number = 10) {
        this.logger.log(`Syncing dividends for ${ticker} (${years} years)`);

        // 1. Verificar se o asset existe
        const asset = await this.prisma.asset.findUnique({
            where: { ticker },
        });

        if (!asset) {
            throw new NotFoundException(`Asset with ticker ${ticker} not found`);
        }

        // 2. Buscar dividendos da Brapi
        const brapiDividends = await this.brapiService.getDividendHistory(ticker, years);

        if (brapiDividends.length === 0) {
            this.logger.log(`No dividends found for ${ticker}`);
            return [];
        }

        // 3. Mapear e inserir no banco (upsert para evitar duplicatas)
        const dividends = await Promise.all(
            brapiDividends.map(async (brapiDiv) => {
                const dividend = await this.prisma.dividend.upsert({
                    where: {
                        assetId_paymentDate_type: {
                            assetId: asset.id,
                            paymentDate: new Date(brapiDiv.paymentDate || brapiDiv.date),
                            type: this.mapDividendType(brapiDiv.type),
                        },
                    },
                    update: {
                        value: brapiDiv.rate,
                        exDate: new Date(brapiDiv.relatedTo),
                    },
                    create: {
                        assetId: asset.id,
                        paymentDate: new Date(brapiDiv.paymentDate || brapiDiv.date),
                        exDate: new Date(brapiDiv.relatedTo),
                        value: brapiDiv.rate,
                        type: this.mapDividendType(brapiDiv.type),
                    },
                });

                return {
                    ...dividend,
                    value: Number(dividend.value),
                };
            }),
        );

        this.logger.log(`Synced ${dividends.length} dividends for ${ticker}`);

        return dividends;
    }

    private mapDividendType(brapiType: string): string {
        if (brapiType === 'JCP' || brapiType === 'JSCP') {
            return 'JCP';
        }
        return 'DIVIDEND';
    }
}
