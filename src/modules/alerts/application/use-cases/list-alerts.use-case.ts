import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { IPriceAlert } from '../../domain/interfaces/alert.interface';

@Injectable()
export class ListAlertsUseCase {
    private readonly logger = new Logger(ListAlertsUseCase.name);

    constructor(private readonly prisma: PrismaService) { }

    async execute(userId: string, limit?: number): Promise<IPriceAlert[]> {
        const alerts = await this.prisma.priceAlert.findMany({
            where: { userId },
            include: {
                asset: {
                    select: {
                        ticker: true,
                        name: true,
                        currentPrice: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        return alerts.map(alert => ({
            ...alert,
            targetPrice: Number(alert.targetPrice),
            asset: {
                ...alert.asset,
                currentPrice: alert.asset.currentPrice,
            }
        })) as unknown as IPriceAlert[];
    }
}
