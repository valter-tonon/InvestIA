import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { AssetOutput } from '../dtos';

@Injectable()
export class FindAssetUseCase {
    private readonly logger = new Logger(FindAssetUseCase.name);

    constructor(private readonly prisma: PrismaService) { }

    async execute(id: string): Promise<AssetOutput> {
        this.logger.log(`Finding asset with ID: ${id}`);

        const asset = await this.prisma.asset.findUnique({
            where: { id },
        });

        if (!asset) {
            throw new NotFoundException('Ativo não encontrado');
        }

        return AssetOutput.fromEntity(asset);
    }
}
