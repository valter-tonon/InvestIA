import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { CreateAlertDto } from '../dto/create-alert.dto';
import { IPriceAlert } from '../../domain/interfaces/alert.interface';

@Injectable()
export class CreateAlertUseCase {
    private readonly logger = new Logger(CreateAlertUseCase.name);

    constructor(private readonly prisma: PrismaService) { }

    async execute(userId: string, input: CreateAlertDto): Promise<IPriceAlert> {
        this.logger.log(`Creating alert for user ${userId} and asset ${input.assetId}`);

        // Verify asset exists
        const asset = await this.prisma.asset.findUnique({
            where: { id: input.assetId },
        });

        if (!asset) {
            throw new NotFoundException(`Asset with ID ${input.assetId} not found`);
        }

        // Create alert
        const alert = await this.prisma.priceAlert.create({
            data: {
                userId,
                assetId: input.assetId,
                targetPrice: input.targetPrice,
                condition: input.condition,
            },
        });

        // Convert decimal to number for interface compatibility if necessary, 
        // but Prisma Client usually handles Decimal -> number conversion or returns Decimal object.
        // We might need to map it if IPriceAlert expects number.

        return {
            ...alert,
            targetPrice: Number(alert.targetPrice),
        } as unknown as IPriceAlert;
    }
}
