import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { IngestionUseCase } from 'src/ingestion/application/use-cases/ingestion.usecase';

@Injectable()
export class IngestionScheduler {
  private readonly logger = new Logger(IngestionScheduler.name);

  constructor(private readonly ingestionUseCase: IngestionUseCase) {}

  @Cron('0 * * * *') // Runs every hour
  async handleScheduledIngestion() {
    this.logger.log('Starting scheduled ingestion...');
    try {
      await this.ingestionUseCase.execute();
      this.logger.log('Scheduled ingestion completed successfully.');
    } catch (err) {
      this.logger.error('Error during scheduled ingestion', err);
    }
  }
}
