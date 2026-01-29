import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { AssetOutput } from '../dtos';

@Injectable()
export class FindAssetByTickerUseCase {
    private readonly logger = new Logger(FindAssetByTickerUseCase.name);

    constructor(private readonly prisma: PrismaService) { }

    async execute(ticker: string): Promise<AssetOutput> {
        this.logger.log(`Finding asset with ticker: ${ticker}`);

        const asset = await this.prisma.asset.findUnique({
            where: { ticker: ticker.toUpperCase() },
        });

        if (!asset) {
            throw new NotFoundException(`Ativo com ticker ${ticker} não encontrado`);
        }

        return AssetOutput.fromEntity(asset);
    }
}
