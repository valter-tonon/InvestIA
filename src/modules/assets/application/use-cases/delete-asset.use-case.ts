import { Injectable, NotFoundException, Logger, Inject } from '@nestjs/common';
import type { IAssetRepository } from '../interfaces/asset-repository.interface';

// ARCH-001/002: Use case now depends on IAssetRepository interface
@Injectable()
export class DeleteAssetUseCase {
    private readonly logger = new Logger(DeleteAssetUseCase.name);

    constructor(
        @Inject('IAssetRepository')
        private readonly assetRepository: IAssetRepository,
    ) { }

    async execute(id: string): Promise<void> {
        this.logger.log(`Deleting asset with ID: ${id}`);

        // Verificar se ativo existe
        const existingAsset = await this.assetRepository.findById(id);

        if (!existingAsset) {
            throw new NotFoundException('Ativo não encontrado');
        }

        await this.assetRepository.delete(id);

        this.logger.log(`Asset deleted: ${existingAsset.ticker}`);
    }
}
