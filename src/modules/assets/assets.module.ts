import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { MarketDataModule } from '../market-data';
import {
    CreateAssetUseCase,
    FindAssetUseCase,
    FindAssetByTickerUseCase,
    ListAssetsUseCase,
    UpdateAssetUseCase,
    UpdateIndicatorsUseCase,
    DeleteAssetUseCase,
} from './application/use-cases';
import { ImportAssetsFromBrapiUseCase } from './application/use-cases/import-assets-from-brapi.use-case';
import { SearchAndImportAssetUseCase } from './application/use-cases/search-and-import-asset.use-case';
import { AssetsController } from './infrastructure/controllers/assets.controller';
import { PrismaAssetRepository } from './infrastructure/repositories/prisma-asset.repository';

@Module({
    imports: [DatabaseModule, MarketDataModule],
    controllers: [AssetsController],
    providers: [
        // ARCH-001: Register repository implementation with interface token
        {
            provide: 'IAssetRepository',
            useClass: PrismaAssetRepository,
        },
        CreateAssetUseCase,
        FindAssetUseCase,
        FindAssetByTickerUseCase,
        ListAssetsUseCase,
        UpdateAssetUseCase,
        UpdateIndicatorsUseCase,
        DeleteAssetUseCase,
        ImportAssetsFromBrapiUseCase,
        SearchAndImportAssetUseCase,
    ],
    exports: [
        CreateAssetUseCase,
        FindAssetUseCase,
        FindAssetByTickerUseCase,
        ListAssetsUseCase,
        UpdateAssetUseCase,
        UpdateIndicatorsUseCase,
        DeleteAssetUseCase,
    ],
})
export class AssetsModule { }
