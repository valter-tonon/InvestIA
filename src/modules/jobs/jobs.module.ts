import { Module, OnModuleInit } from '@nestjs/common';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { MarketDataModule } from '../market-data/market-data.module';
import { SyncAssetsService } from './services/sync-assets.service';
import { SyncAssetsProcessor } from './processors/sync-assets.processor';
import { JobsController } from './infrastructure/controllers/jobs.controller';

@Module({
    imports: [
        DatabaseModule,
        MarketDataModule,
        BullModule.registerQueue({
            name: 'sync-assets',
        }),
    ],
    controllers: [JobsController],
    providers: [SyncAssetsService, SyncAssetsProcessor],
    exports: [SyncAssetsService],
})
export class JobsModule implements OnModuleInit {
    constructor(
        @InjectQueue('sync-assets') private readonly syncAssetsQueue: Queue,
    ) { }

    async onModuleInit() {
        // Agendar job diário às 19h (Seg-Sex)
        await this.syncAssetsQueue.add(
            'sync-all',
            {},
            {
                repeat: {
                    pattern: '0 19 * * 1-5', // Cron: às 19h, segunda a sexta
                },
                removeOnComplete: 10,
                removeOnFail: 50,
            },
        );
    }
}
