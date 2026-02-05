import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@Injectable()
export class GetDividendHistoryUseCase {
    private readonly logger = new Logger(GetDividendHistoryUseCase.name);

    constructor(private readonly prisma: PrismaService) { }

    async execute(ticker: string, years?: number) {
        this.logger.log(`Getting dividend history for ${ticker}`);

        // 1. Buscar asset pelo ticker
        const asset = await this.prisma.asset.findUnique({
            where: { ticker },
        });

        if (!asset) {
            throw new NotFoundException(`Asset with ticker ${ticker} not found`);
        }

        // 2. Calcular data limite se years foi especificado
        const dateLimit = years
            ? new Date(new Date().setFullYear(new Date().getFullYear() - years))
            : undefined;

        // 3. Buscar dividendos do banco
        const dividends = await this.prisma.dividend.findMany({
            where: {
                assetId: asset.id,
                ...(dateLimit && {
                    paymentDate: {
                        gte: dateLimit,
                    },
                }),
            },
            orderBy: {
                paymentDate: 'desc',
            },
        });

        this.logger.log(`Found ${dividends.length} dividends for ${ticker}`);

        // 4. Converter Decimal para number
        return dividends.map((div) => ({
            ...div,
            value: Number(div.value),
        }));
    }
}
