import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MarketDataService } from './services/market-data.service';
import { BrapiService } from './services/brapi.service';
import { SyncMarketDataProcessor, SYNC_MARKET_DATA_QUEUE } from './jobs/sync-market-data.processor';

@Module({
    imports: [
        BullModule.registerQueue({
            name: SYNC_MARKET_DATA_QUEUE,
        }),
    ],
    providers: [MarketDataService, BrapiService, SyncMarketDataProcessor],
    exports: [MarketDataService, BrapiService],
})
export class MarketDataModule { }
