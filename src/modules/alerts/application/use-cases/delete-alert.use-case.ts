import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@Injectable()
export class DeleteAlertUseCase {
    private readonly logger = new Logger(DeleteAlertUseCase.name);

    constructor(private readonly prisma: PrismaService) { }

    async execute(userId: string, alertId: string): Promise<void> {
        // Check existence and ownership
        const existingAlert = await this.prisma.priceAlert.findUnique({
            where: { id: alertId },
        });

        if (!existingAlert) {
            throw new NotFoundException(`Alert ${alertId} not found`);
        }

        if (existingAlert.userId !== userId) {
            throw new ForbiddenException('You can only delete your own alerts');
        }

        await this.prisma.priceAlert.delete({
            where: { id: alertId },
        });

        this.logger.log(`Alert ${alertId} deleted by user ${userId}`);
    }
}
