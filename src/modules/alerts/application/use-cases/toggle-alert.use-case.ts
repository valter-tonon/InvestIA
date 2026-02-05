import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { IPriceAlert } from '../../domain/interfaces/alert.interface';

@Injectable()
export class ToggleAlertUseCase {
    private readonly logger = new Logger(ToggleAlertUseCase.name);

    constructor(private readonly prisma: PrismaService) { }

    async execute(userId: string, alertId: string): Promise<IPriceAlert> {
        const existingAlert = await this.prisma.priceAlert.findUnique({
            where: { id: alertId },
        });

        if (!existingAlert) {
            throw new NotFoundException(`Alert ${alertId} not found`);
        }

        if (existingAlert.userId !== userId) {
            throw new ForbiddenException('You can only toggle your own alerts');
        }

        const updated = await this.prisma.priceAlert.update({
            where: { id: alertId },
            data: { isActive: !existingAlert.isActive },
        });

        return {
            ...updated,
            targetPrice: Number(updated.targetPrice),
        } as unknown as IPriceAlert;
    }
}
