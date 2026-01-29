import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { CreateAssetInput, AssetOutput } from '../dtos';

@Injectable()
export class CreateAssetUseCase {
    private readonly logger = new Logger(CreateAssetUseCase.name);

    constructor(private readonly prisma: PrismaService) { }

    async execute(input: CreateAssetInput): Promise<AssetOutput> {
        this.logger.log(`Creating asset with ticker: ${input.ticker}`);

        // Verificar se ticker já existe
        const existingAsset = await this.prisma.asset.findUnique({
            where: { ticker: input.ticker },
        });

        if (existingAsset) {
            throw new ConflictException(`Ticker ${input.ticker} já está cadastrado`);
        }

        const asset = await this.prisma.asset.create({
            data: {
                ticker: input.ticker,
                name: input.name,
                type: input.type,
                sector: input.sector,
            },
        });

        this.logger.log(`Asset created: ${asset.ticker} (${asset.id})`);
        return AssetOutput.fromEntity(asset);
    }
}
