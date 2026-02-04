import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { MarketDataModule } from '../market-data/market-data.module';
import { DividendsController } from './infrastructure/controllers/dividends.controller';
import { GetDividendHistoryUseCase } from './application/use-cases/get-dividend-history.use-case';
import { SyncDividendsUseCase } from './application/use-cases/sync-dividends.use-case';

@Module({
    imports: [DatabaseModule, MarketDataModule],
    controllers: [DividendsController],
    providers: [GetDividendHistoryUseCase, SyncDividendsUseCase],
    exports: [GetDividendHistoryUseCase],
})
export class DividendsModule { }
