import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CronJob } from 'cron';
import { ConfigService } from '@nestjs/config';
import {
  IIngestionService,
  IIngestionServiceToken,
} from 'src/domain/ingestion/ingestion.service.interface';

@Injectable()
export class IngestionScheduler implements OnModuleInit {
  private readonly logger = new Logger(IngestionScheduler.name);

  constructor(
    @Inject(IIngestionServiceToken)
    private readonly ingestionService: IIngestionService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    const cronExpression =
      this.configService.get<string>('INGESTION_CRON') || '0 * * * *';

    const job = new CronJob(cronExpression, async () => {
      this.logger.log('Starting scheduled ingestion...');
      try {
        await this.ingestionService.ingestAll();
        this.logger.log('Scheduled ingestion completed successfully.');
      } catch (err) {
        this.logger.error('Error during ingestion', err);
      }
    });

    job.start();
    this.logger.log(`Ingestion cron job started: ${cronExpression}`);
  }
}
