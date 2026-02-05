import { Injectable, NotFoundException, Logger, Inject } from '@nestjs/common';
import type { IAssetRepository } from '../interfaces/asset-repository.interface';
import { UpdateAssetInput, AssetOutput } from '../dtos';

// ARCH-001/002: Use case now depends on IAssetRepository interface
@Injectable()
export class UpdateAssetUseCase {
    private readonly logger = new Logger(UpdateAssetUseCase.name);

    constructor(
        @Inject('IAssetRepository')
        private readonly assetRepository: IAssetRepository,
    ) { }

    async execute(id: string, input: UpdateAssetInput): Promise<AssetOutput> {
        this.logger.log(`Updating asset with ID: ${id}`);

        // Verificar se ativo existe
        const existingAsset = await this.assetRepository.findById(id);

        if (!existingAsset) {
            throw new NotFoundException('Ativo não encontrado');
        }

        const asset = await this.assetRepository.update(id, {
            name: input.name,
            type: input.type,
            sector: input.sector,
        });

        this.logger.log(`Asset updated: ${asset.ticker}`);
        return AssetOutput.fromEntity(asset);
    }
}
