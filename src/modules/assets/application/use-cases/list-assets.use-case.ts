import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { AssetOutput } from '../dtos';

export interface ListAssetsOptions {
    page?: number;
    perPage?: number;
    type?: string;
    sector?: string;
    minDY?: number;
    maxPE?: number;
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

@Injectable()
export class ListAssetsUseCase {
    private readonly logger = new Logger(ListAssetsUseCase.name);

    constructor(private readonly prisma: PrismaService) { }

    async execute(options: ListAssetsOptions = {}): Promise<ListAssetsResult> {
        const page = options.page ?? 1;
        const perPage = Math.min(options.perPage ?? 20, 100);
        const skip = (page - 1) * perPage;

        // Construir filtros
        const where: any = {};

        if (options.type) {
            where.type = options.type;
        }

        if (options.sector) {
            where.sector = options.sector;
        }

        if (options.minDY !== undefined) {
            where.dividendYield = { gte: options.minDY };
        }

        if (options.maxPE !== undefined) {
            where.priceToEarnings = { lte: options.maxPE };
        }

        this.logger.log(`Listing assets - page: ${page}, filters: ${JSON.stringify(where)}`);

        const [assets, total] = await Promise.all([
            this.prisma.asset.findMany({
                where,
                skip,
                take: perPage,
                orderBy: { ticker: 'asc' },
            }),
            this.prisma.asset.count({ where }),
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
