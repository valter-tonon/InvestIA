import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { UpdateAssetInput, AssetOutput } from '../dtos';

@Injectable()
export class UpdateAssetUseCase {
    private readonly logger = new Logger(UpdateAssetUseCase.name);

    constructor(private readonly prisma: PrismaService) { }

    async execute(id: string, input: UpdateAssetInput): Promise<AssetOutput> {
        this.logger.log(`Updating asset with ID: ${id}`);

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
                name: input.name,
                type: input.type,
                sector: input.sector,
            },
        });

        this.logger.log(`Asset updated: ${asset.ticker}`);
        return AssetOutput.fromEntity(asset);
    }
}
