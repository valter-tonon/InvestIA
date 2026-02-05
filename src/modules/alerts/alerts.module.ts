import { Module, OnModuleInit, Logger, Injectable } from '@nestjs/common';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { AlertsController } from './infrastructure/controllers/alerts.controller';
import { CreateAlertUseCase } from './application/use-cases/create-alert.use-case';
import { ListAlertsUseCase } from './application/use-cases/list-alerts.use-case';
import { UpdateAlertUseCase } from './application/use-cases/update-alert.use-case';
import { DeleteAlertUseCase } from './application/use-cases/delete-alert.use-case';
import { ToggleAlertUseCase } from './application/use-cases/toggle-alert.use-case';
import { CheckAlertsUseCase } from './application/use-cases/check-alerts.use-case';
import { EmailNotificationService } from './infrastructure/services/email-notification.service';
import { CheckAlertsProcessor, ALERTS_QUEUE, CHECK_ALERTS_JOB } from './infrastructure/jobs/check-alerts.processor';

@Module({
  imports: [
    DatabaseModule,
    BullModule.registerQueue({
      name: ALERTS_QUEUE,
    }),
  ],
  controllers: [AlertsController],
  providers: [
    CreateAlertUseCase,
    ListAlertsUseCase,
    UpdateAlertUseCase,
    DeleteAlertUseCase,
    ToggleAlertUseCase,
    CheckAlertsUseCase,
    EmailNotificationService,
    CheckAlertsProcessor,
  ],
  exports: [
    ListAlertsUseCase,
  ],
})
export class AlertsModule implements OnModuleInit {
  private readonly logger = new Logger(AlertsModule.name);

  constructor(
    @InjectQueue(ALERTS_QUEUE) private readonly alertsQueue: Queue,
  ) { }

  async onModuleInit() {
    this.logger.log('Initializing Alerts Module...');

    // Schedule recurring job to check alerts every 5 minutes
    await this.alertsQueue.add(
      CHECK_ALERTS_JOB,
      {},
      {
        repeat: {
          pattern: '*/5 * * * *', // Every 5 minutes
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    this.logger.log('Scheduled recurring job: check_alerts (every 5 minutes)');
  }
}
