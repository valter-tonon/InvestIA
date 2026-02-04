import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { BrasilApiService } from '../services/brasil-api.service';

@Processor('sync-indicators')
export class SyncIndicatorsProcessor extends WorkerHost {
    private readonly logger = new Logger(SyncIndicatorsProcessor.name);

    constructor(
        private readonly brasilApiService: BrasilApiService,
    ) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        this.logger.log(`Processing job ${job.name} id: ${job.id}`);

        try {
            switch (job.name) {
                case 'sync-all':
                    await this.brasilApiService.syncIndicators();
                    break;
                default:
                    this.logger.warn(`Unknown job name: ${job.name}`);
            }
        } catch (error) {
            this.logger.error(`Failed to process job ${job.name}`, error);
            throw error;
        }
    }
}
