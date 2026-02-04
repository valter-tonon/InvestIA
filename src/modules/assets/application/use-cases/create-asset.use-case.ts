import { Injectable, ConflictException, Logger, Inject } from '@nestjs/common';
import type { IAssetRepository } from '../interfaces/asset-repository.interface';
import { CreateAssetInput, AssetOutput } from '../dtos';

// ARCH-001/002: Use case now depends on IAssetRepository interface
@Injectable()
export class CreateAssetUseCase {
    private readonly logger = new Logger(CreateAssetUseCase.name);

    constructor(
        @Inject('IAssetRepository')
        private readonly assetRepository: IAssetRepository,
    ) { }

    async execute(input: CreateAssetInput): Promise<AssetOutput> {
        this.logger.log(`Creating asset with ticker: ${input.ticker}`);

        // Verificar se ticker já existe
        const existing = await this.assetRepository.findByTicker(input.ticker);
        if (existing) {
            throw new ConflictException(`Ativo com ticker ${input.ticker} já existe`);
        }

        const asset = await this.assetRepository.create({
            ticker: input.ticker,
            name: input.name,
            type: input.type,
            sector: input.sector,
        });

        this.logger.log(`Asset created: ${asset.ticker} (${asset.id})`);
        return AssetOutput.fromEntity(asset);
    }
}
