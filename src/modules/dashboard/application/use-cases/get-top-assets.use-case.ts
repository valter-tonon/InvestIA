import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { TopAsset } from '../../domain/interfaces/dashboard-data.interface';

@Injectable()
export class GetTopAssetsUseCase {
    private readonly logger = new Logger(GetTopAssetsUseCase.name);

    constructor(private readonly prisma: PrismaService) { }

    async execute(userId: string, limit: number = 5): Promise<TopAsset[]> {
        try {
            // Get top assets by current price
            const assets = await this.prisma.asset.findMany({
                where: {
                    currentPrice: { not: null },
                },
                select: {
                    ticker: true,
                    name: true,
                    currentPrice: true,
                },
                orderBy: {
                    currentPrice: 'desc',
                },
                take: limit,
            });

            // Calculate total value for percentages
            // DB-002: Convert Decimal to number for arithmetic
            const totalValue = assets.reduce((sum, asset) => sum + Number(asset.currentPrice || 0), 0);

            // Map to TopAsset format
            const topAssets: TopAsset[] = assets.map(asset => ({
                ticker: asset.ticker,
                name: asset.name,
                value: Number(asset.currentPrice || 0),
                change: Math.random() * 20 - 10, // Mock change for now
                percentage: Math.round((Number(asset.currentPrice || 0) / totalValue) * 100 * 100) / 100,
            }));

            this.logger.log(`Top ${limit} assets generated for user ${userId}`);

            return topAssets;
        } catch (error) {
            this.logger.error(`Error generating top assets: ${error.message}`);
            throw error;
        }
    }
}
