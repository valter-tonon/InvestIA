import { Injectable, Logger, Inject } from '@nestjs/common';
import type { IAssetRepository } from '../interfaces/asset-repository.interface';
import { AssetOutput } from '../dtos';

export interface ListAssetsOptions {
    page?: number;
    perPage?: number;
    type?: string;
    sector?: string;
    search?: string;
}

export interface ListAssetsResult {
    data: AssetOutput[];
    meta: {
        total: number;
        page: number;
        perPage: number;
        lastPage: number;
    };
}

// ARCH-001/002: Use case now depends on IAssetRepository interface
@Injectable()
export class ListAssetsUseCase {
    private readonly logger = new Logger(ListAssetsUseCase.name);

    constructor(
        @Inject('IAssetRepository')
        private readonly assetRepository: IAssetRepository,
    ) { }

    async execute(options: ListAssetsOptions = {}): Promise<ListAssetsResult> {
        const page = options.page ?? 1;
        const perPage = Math.min(options.perPage ?? 20, 100);

        const filters: any = {};
        if (options.type) filters.type = options.type;
        if (options.sector) filters.sector = options.sector;
        if (options.search) filters.search = options.search;

        this.logger.log(`Listing assets - page: ${page}, filters: ${JSON.stringify(filters)}`);

        const [assets, total] = await Promise.all([
            this.assetRepository.findAll(page, perPage, filters),
            this.assetRepository.count(filters),
        ]);

        return {
            data: assets.map(AssetOutput.fromEntity),
            meta: {
                total,
                page,
                perPage,
                lastPage: Math.ceil(total / perPage),
            },
        };
    }
}
