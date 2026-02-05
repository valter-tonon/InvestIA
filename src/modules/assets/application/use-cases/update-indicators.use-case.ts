import { Injectable, NotFoundException, Logger, Inject } from '@nestjs/common';
import type { IAssetRepository } from '../interfaces/asset-repository.interface';
import { UpdateIndicatorsInput, AssetOutput } from '../dtos';

// ARCH-001/002: Use case now depends on IAssetRepository interface
@Injectable()
export class UpdateIndicatorsUseCase {
    private readonly logger = new Logger(UpdateIndicatorsUseCase.name);

    constructor(
        @Inject('IAssetRepository')
        private readonly assetRepository: IAssetRepository,
    ) { }

    async execute(id: string, input: UpdateIndicatorsInput): Promise<AssetOutput> {
        this.logger.log(`Updating indicators for asset ID: ${id}`);

        // Verificar se ativo existe
        const existingAsset = await this.assetRepository.findById(id);

        if (!existingAsset) {
            throw new NotFoundException('Ativo não encontrado');
        }

        const asset = await this.assetRepository.updateIndicators(id, {
            currentPrice: input.currentPrice,
            dividendYield: input.dividendYield,
            priceToEarnings: input.priceToEarnings,
            priceToBook: input.priceToBook,
            roe: input.roe,
            netMargin: input.netMargin,
            debtToEquity: input.debtToEquity,
        });

        this.logger.log(`Indicators updated for: ${asset.ticker}`);
        return AssetOutput.fromEntity(asset);
    }
}
