import { Module, OnModuleInit } from '@nestjs/common';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { BrasilApiService } from './services/brasil-api.service';
import { SyncIndicatorsProcessor } from './jobs/sync-indicators.processor';
import { IndicatorsController } from './controllers/indicators.controller';

@Module({
    imports: [
        DatabaseModule,
        BullModule.registerQueue({
            name: 'sync-indicators',
        }),
    ],
    controllers: [IndicatorsController],
    providers: [BrasilApiService, SyncIndicatorsProcessor],
    exports: [BrasilApiService],
})
export class EconomicIndicatorsModule implements OnModuleInit {
    constructor(
        @InjectQueue('sync-indicators') private readonly indicatorsQueue: Queue,
    ) { }

    async onModuleInit() {
        // Schedule daily sync at 06:00 AM
        // Remove existing repeatable jobs to avoid duplicates on restart/deploy
        const repeatableJobs = await this.indicatorsQueue.getRepeatableJobs();
        for (const job of repeatableJobs) {
            await this.indicatorsQueue.removeRepeatableByKey(job.key);
        }

        await this.indicatorsQueue.add(
            'sync-all',
            {},
            {
                repeat: {
                    pattern: '0 6 * * *', // Daily at 06:00 AM
                },
                removeOnComplete: 10,
                removeOnFail: 50,
            },
        );

        // Initial sync on startup
        await this.indicatorsQueue.add('sync-all', {});
    }
}
