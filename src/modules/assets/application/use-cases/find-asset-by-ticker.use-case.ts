import { Injectable, NotFoundException, Logger, Inject } from '@nestjs/common';
import type { IAssetRepository } from '../interfaces/asset-repository.interface';
import { AssetOutput } from '../dtos';

// ARCH-001/002: Use case now depends on IAssetRepository interface
@Injectable()
export class FindAssetByTickerUseCase {
    private readonly logger = new Logger(FindAssetByTickerUseCase.name);

    constructor(
        @Inject('IAssetRepository')
        private readonly assetRepository: IAssetRepository,
    ) { }

    async execute(ticker: string): Promise<AssetOutput> {
        this.logger.log(`Finding asset with ticker: ${ticker}`);

        const asset = await this.assetRepository.findByTicker(ticker);

        if (!asset) {
            throw new NotFoundException(`Ativo ${ticker} não encontrado`);
        }

        return AssetOutput.fromEntity(asset);
    }
}
