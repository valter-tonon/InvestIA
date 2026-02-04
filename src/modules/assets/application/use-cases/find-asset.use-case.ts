import { Injectable, NotFoundException, Logger, Inject } from '@nestjs/common';
import type { IAssetRepository } from '../interfaces/asset-repository.interface';
import { AssetOutput } from '../dtos';

// ARCH-001/002: Use case now depends on IAssetRepository interface
@Injectable()
export class FindAssetUseCase {
    private readonly logger = new Logger(FindAssetUseCase.name);

    constructor(
        @Inject('IAssetRepository')
        private readonly assetRepository: IAssetRepository,
    ) { }

    async execute(id: string): Promise<AssetOutput> {
        this.logger.log(`Finding asset with ID: ${id}`);

        const asset = await this.assetRepository.findById(id);

        if (!asset) {
            throw new NotFoundException('Ativo não encontrado');
        }

        return AssetOutput.fromEntity(asset);
    }
}
