import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { SyncAssetsService } from '../services/sync-assets.service';

@Processor('sync-assets')
export class SyncAssetsProcessor extends WorkerHost {
    private readonly logger = new Logger(SyncAssetsProcessor.name);

    constructor(private readonly syncAssetsService: SyncAssetsService) {
        super();
    }

    async process(job: Job): Promise<any> {
        this.logger.log(`Processing job ${job.id}: ${job.name}`);

        try {
            const result = await this.syncAssetsService.syncAll();

            this.logger.log(
                `Job ${job.id} completed: ${result.updated}/${result.total} assets updated`,
            );

            if (result.errors.length > 0) {
                this.logger.warn(`Errors: ${JSON.stringify(result.errors)}`);
            }

            return result;
        } catch (error) {
            this.logger.error(`Job ${job.id} failed: ${error.message}`);
            throw error;
        }
    }
}
