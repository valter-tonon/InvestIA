import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { UpdateIndicatorsInput, AssetOutput } from '../dtos';

@Injectable()
export class UpdateIndicatorsUseCase {
    private readonly logger = new Logger(UpdateIndicatorsUseCase.name);

    constructor(private readonly prisma: PrismaService) { }

    async execute(id: string, input: UpdateIndicatorsInput): Promise<AssetOutput> {
        this.logger.log(`Updating indicators for asset ID: ${id}`);

        // Verificar se ativo existe
        const existingAsset = await this.prisma.asset.findUnique({
            where: { id },
        });

        if (!existingAsset) {
            throw new NotFoundException('Ativo não encontrado');
        }

        const asset = await this.prisma.asset.update({
            where: { id },
            data: {
                currentPrice: input.currentPrice,
                dividendYield: input.dividendYield,
                priceToEarnings: input.priceToEarnings,
                priceToBook: input.priceToBook,
                roe: input.roe,
                netMargin: input.netMargin,
                debtToEquity: input.debtToEquity,
                lastUpdated: new Date(),
            },
        });

        this.logger.log(`Indicators updated for: ${asset.ticker}`);
        return AssetOutput.fromEntity(asset);
    }
}
