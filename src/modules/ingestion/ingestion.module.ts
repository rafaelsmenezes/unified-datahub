import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { IngestionService } from './ingestion.service';
import { IngestionScheduler } from './ingestion.scheduler';

@Module({
  imports: [StorageModule],
  providers: [IngestionService, IngestionScheduler],
  exports: [IngestionService],
})
export class IngestionModule {}
