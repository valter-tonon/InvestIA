import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import {
    CreateAssetUseCase,
    FindAssetUseCase,
    FindAssetByTickerUseCase,
    ListAssetsUseCase,
    UpdateAssetUseCase,
    UpdateIndicatorsUseCase,
    DeleteAssetUseCase,
} from './application/use-cases';
import { AssetsController } from './infrastructure/controllers/assets.controller';

@Module({
    imports: [DatabaseModule],
    controllers: [AssetsController],
    providers: [
        CreateAssetUseCase,
        FindAssetUseCase,
        FindAssetByTickerUseCase,
        ListAssetsUseCase,
        UpdateAssetUseCase,
        UpdateIndicatorsUseCase,
        DeleteAssetUseCase,
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
