import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { UpdateAlertDto } from '../dto/update-alert.dto';
import { IPriceAlert } from '../../domain/interfaces/alert.interface';

@Injectable()
export class UpdateAlertUseCase {
    private readonly logger = new Logger(UpdateAlertUseCase.name);

    constructor(private readonly prisma: PrismaService) { }

    async execute(userId: string, alertId: string, input: UpdateAlertDto): Promise<IPriceAlert> {
        // Check existence and ownership
        const existingAlert = await this.prisma.priceAlert.findUnique({
            where: { id: alertId },
        });

        if (!existingAlert) {
            throw new NotFoundException(`Alert ${alertId} not found`);
        }

        if (existingAlert.userId !== userId) {
            throw new ForbiddenException('You can only update your own alerts');
        }

        const updated = await this.prisma.priceAlert.update({
            where: { id: alertId },
            data: input,
        });

        return {
            ...updated,
            targetPrice: Number(updated.targetPrice),
        } as unknown as IPriceAlert;
    }
}
