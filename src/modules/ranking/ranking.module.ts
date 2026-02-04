import { Module } from '@nestjs/common';
import { AssetsModule } from '../assets/assets.module';
import { MarketDataModule } from '../market-data/market-data.module';
import { RankingController } from './infrastructure/controllers/ranking.controller';
import { RankAssetsUseCase } from './application/use-cases/rank-assets.use-case';
import { CalculateScoreService } from './domain/services/calculate-score.service';

@Module({
    imports: [AssetsModule, MarketDataModule],
    controllers: [RankingController],
    providers: [
        RankAssetsUseCase,
        CalculateScoreService,
    ],
    exports: [RankAssetsUseCase],
})
export class RankingModule { }
