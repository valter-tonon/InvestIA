import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { PerformanceDataPoint } from '../../domain/interfaces/dashboard-data.interface';

@Injectable()
export class GetPortfolioPerformanceUseCase {
    private readonly logger = new Logger(GetPortfolioPerformanceUseCase.name);

    constructor(private readonly prisma: PrismaService) { }

    async execute(userId: string, period: string = '30d'): Promise<PerformanceDataPoint[]> {
        try {
            // For now, return mock data
            // TODO: Implement real historical data when wallet tracking is ready
            const mockData = this.generateMockPerformance(period);

            this.logger.log(`Portfolio performance generated for user ${userId}, period: ${period}`);

            return mockData;
        } catch (error) {
            this.logger.error(`Error generating portfolio performance: ${error.message}`);
            throw error;
        }
    }

    private generateMockPerformance(period: string): PerformanceDataPoint[] {
        const days = this.getPeriodDays(period);
        const data: PerformanceDataPoint[] = [];
        const baseValue = 50000;

        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (days - i - 1));

            const randomChange = (Math.random() - 0.5) * 1000;
            const value = baseValue + randomChange * i;
            const change = ((value - baseValue) / baseValue) * 100;

            data.push({
                date: date.toISOString().split('T')[0],
                value: Math.round(value * 100) / 100,
                change: Math.round(change * 100) / 100,
            });
        }

        return data;
    }

    private getPeriodDays(period: string): number {
        switch (period) {
            case '7d': return 7;
            case '30d': return 30;
            case '90d': return 90;
            case '1y': return 365;
            default: return 30;
        }
    }
}
