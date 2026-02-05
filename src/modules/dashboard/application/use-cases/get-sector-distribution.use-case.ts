import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { SectorDistribution } from '../../domain/interfaces/dashboard-data.interface';

@Injectable()
export class GetSectorDistributionUseCase {
    private readonly logger = new Logger(GetSectorDistributionUseCase.name);

    constructor(private readonly prisma: PrismaService) { }

    async execute(userId: string): Promise<SectorDistribution[]> {
        try {
            // Get assets grouped by sector
            const assets = await this.prisma.asset.findMany({
                where: {
                    sector: { not: null },
                },
                select: {
                    sector: true,
                    currentPrice: true,
                },
            });

            // Group by sector
            const sectorMap = new Map<string, { count: number; value: number }>();

            assets.forEach(asset => {
                if (!asset.sector) return;

                const existing = sectorMap.get(asset.sector) || { count: 0, value: 0 };
                existing.count += 1;
                // DB-002: Convert Decimal to number for arithmetic
                existing.value += Number(asset.currentPrice || 0);
                sectorMap.set(asset.sector, existing);
            });

            // Calculate total value
            const totalValue = Array.from(sectorMap.values())
                .reduce((sum, item) => sum + item.value, 0);

            // Convert to array with percentages
            const distribution: SectorDistribution[] = Array.from(sectorMap.entries())
                .map(([sector, data]) => ({
                    sector,
                    value: Math.round(data.value * 100) / 100,
                    percentage: Math.round((data.value / totalValue) * 100 * 100) / 100,
                    count: data.count,
                }))
                .sort((a, b) => b.value - a.value);

            this.logger.log(`Sector distribution generated for user ${userId}: ${distribution.length} sectors`);

            return distribution;
        } catch (error) {
            this.logger.error(`Error generating sector distribution: ${error.message}`);
            throw error;
        }
    }
}
