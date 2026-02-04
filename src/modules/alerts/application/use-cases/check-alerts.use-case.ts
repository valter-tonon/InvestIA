import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { EmailNotificationService } from '../../infrastructure/services/email-notification.service';
import { AlertCondition } from '../../domain/interfaces/alert.interface';

@Injectable()
export class CheckAlertsUseCase {
    private readonly logger = new Logger(CheckAlertsUseCase.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationService: EmailNotificationService,
    ) { }

    async execute(): Promise<void> {
        this.logger.log('Starting price alerts check...');

        // Fetch active alerts with asset and user info
        const alerts = await this.prisma.priceAlert.findMany({
            where: {
                isActive: true,
                asset: {
                    currentPrice: { not: null }, // Only assets with price
                },
            },
            include: {
                asset: true,
                user: true,
            },
        });

        this.logger.log(`Found ${alerts.length} active alerts to check.`);

        let triggeredCount = 0;

        for (const alert of alerts) {
            const currentPrice = alert.asset.currentPrice;

            if (currentPrice === null) continue;

            // DB-002: Convert Decimal to number for arithmetic
            const currentPriceNum = Number(currentPrice);
            const targetPrice = Number(alert.targetPrice);
            let triggered = false;

            // Logic check
            if (alert.condition === AlertCondition.ABOVE && currentPriceNum >= targetPrice) {
                triggered = true;
            } else if (alert.condition === AlertCondition.BELOW && currentPriceNum <= targetPrice) {
                triggered = true;
            } else if (alert.condition === AlertCondition.EQUAL && Math.abs(currentPriceNum - targetPrice) < 0.01) {
                triggered = true;
            }

            if (triggered) {
                this.logger.log(`Alert ${alert.id} triggered! Asset: ${alert.asset.ticker}, Price: ${currentPrice}, Target: ${targetPrice}`);

                // Send notification
                await this.notificationService.sendPriceAlert(
                    alert.user.email,
                    alert.user.name || 'Investidor',
                    alert.asset.ticker,
                    currentPriceNum,
                    targetPrice,
                    alert.condition,
                );

                // Update alert status
                await this.prisma.priceAlert.update({
                    where: { id: alert.id },
                    data: {
                        isActive: false, // Turn off after trigger
                        triggeredAt: new Date(),
                    },
                });

                triggeredCount++;
            }
        }

        this.logger.log(`Alerts check finished. Triggered: ${triggeredCount}`);
    }
}
