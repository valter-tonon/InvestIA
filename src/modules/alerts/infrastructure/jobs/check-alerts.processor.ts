import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { CheckAlertsUseCase } from '../../application/use-cases/check-alerts.use-case';

export const ALERTS_QUEUE = 'alerts';
export const CHECK_ALERTS_JOB = 'check_alerts';

@Processor(ALERTS_QUEUE)
export class CheckAlertsProcessor extends WorkerHost {
    private readonly logger = new Logger(CheckAlertsProcessor.name);

    constructor(private readonly checkAlertsUseCase: CheckAlertsUseCase) {
        super();
    }

    async process(job: Job): Promise<any> {
        if (job.name === CHECK_ALERTS_JOB) {
            this.logger.debug('Processing check_alerts job...');
            await this.checkAlertsUseCase.execute();
            return { processed: true };
        }
    }
}
