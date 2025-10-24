import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { IngestionService } from './infrastructure/services/ingestion.service';
import { BatchSaverService } from './infrastructure/services/batch-saver.service';
import { StreamGeneratorService } from './infrastructure/services/stream-generator.service';
import { IngestionScheduler } from './infrastructure/scheduler/ingestion.scheduler';
import { IngestionUseCase } from './application/use-cases/ingestion.usecase';
import { AdminController } from './interfaces/rest/admin.controller';
import { Source1Mapper } from './infrastructure/mappers/source1.mapper';
import { Source2Mapper } from './infrastructure/mappers/source2.mapper';

import { IBatchSaverServiceToken } from './domain/interfaces/batch-saver.interface';
import { IIngestionServiceToken } from './domain/interfaces/ingestion.service.interface';
import { IStreamGeneratorServiceToken } from './domain/interfaces/stream-generator.interface';

import { SharedModule } from '../shared/shared.module';
import { DatasetModule } from '../dataset/dataset.module';

/**
 * Ingestion Module
 *
 * Responsible for fetching data from external sources and persisting it.
 *
 * Domain: Data ingestion from multiple sources
 * - Fetch data from REST APIs
 * - Transform data to unified format
 * - Batch processing and persistence
 * - Scheduled data synchronization
 */
@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    SharedModule, // Database, HTTP, Sources
    DatasetModule, // For data persistence
  ],
  controllers: [AdminController],
  providers: [
    // Infrastructure Services
    {
      provide: IIngestionServiceToken,
      useClass: IngestionService,
    },
    {
      provide: IBatchSaverServiceToken,
      useClass: BatchSaverService,
    },
    {
      provide: IStreamGeneratorServiceToken,
      useClass: StreamGeneratorService,
    },

    // Mappers
    Source1Mapper,
    Source2Mapper,

    // Application Layer
    IngestionUseCase,

    // Scheduler
    IngestionScheduler,
  ],
  exports: [
    IngestionUseCase,
    IIngestionServiceToken,
    IBatchSaverServiceToken,
    IStreamGeneratorServiceToken,
  ],
})
export class IngestionModule {}
