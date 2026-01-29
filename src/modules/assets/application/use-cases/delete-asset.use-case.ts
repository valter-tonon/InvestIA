import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@Injectable()
export class DeleteAssetUseCase {
    private readonly logger = new Logger(DeleteAssetUseCase.name);

    constructor(private readonly prisma: PrismaService) { }

    async execute(id: string): Promise<void> {
        this.logger.log(`Deleting asset with ID: ${id}`);

        // Verificar se ativo existe
        const existingAsset = await this.prisma.asset.findUnique({
            where: { id },
        });

        if (!existingAsset) {
            throw new NotFoundException('Ativo não encontrado');
        }

        await this.prisma.asset.delete({
            where: { id },
        });

        this.logger.log(`Asset deleted: ${existingAsset.ticker}`);
    }
}
