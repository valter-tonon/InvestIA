import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { DashboardSummary } from '../../domain/interfaces/dashboard-data.interface';

@Injectable()
export class GetDashboardSummaryUseCase {
    private readonly logger = new Logger(GetDashboardSummaryUseCase.name);

    constructor(private readonly prisma: PrismaService) { }

    async execute(userId: string): Promise<DashboardSummary> {
        try {
            // Get total number of assets
            const totalAssets = await this.prisma.asset.count();

            // Calculate total value from all assets
            // Note: This is a market overview proxy since we don't have user wallet tracking yet
            const allAssets = await this.prisma.asset.findMany({
                select: { currentPrice: true }
            });
            // DB-002: Convert Decimal to number for arithmetic
            const totalValue = allAssets.reduce((sum, asset) => sum + Number(asset.currentPrice || 0), 0);

            // TODO: Implement calculation of changes when historical data is available
            // For now we mock the change
            const totalChange = 0;

            // Get Top Gainer/Loser (Mocked for now as we don't have 'change' column or history)
            // We will fetch assets with highest price as a placeholder for "importance"
            const topAssets = await this.prisma.asset.findMany({
                orderBy: { currentPrice: 'desc' },
                take: 2,
                select: { ticker: true, currentPrice: true }
            });

            const summary: DashboardSummary = {
                totalAssets,
                totalValue,
                totalChange,
                topGainer: topAssets[0] ? { ticker: topAssets[0].ticker, change: 0 } : undefined,
                topLoser: topAssets[1] ? { ticker: topAssets[1].ticker, change: 0 } : undefined,
            };

            this.logger.log(`Dashboard summary generated for user ${userId}`);

            return summary;
        } catch (error) {
            this.logger.error(`Error generating dashboard summary: ${error.message}`);
            throw error;
        }
    }
}
