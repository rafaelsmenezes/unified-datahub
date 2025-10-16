import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { BatchSaverService } from './batch/batch-saver.service';
import { StreamGeneratorService } from './stream/stream-generator.service';
import { IngestionScheduler } from '../scheduler/ingestion.scheduler';
import { IBatchSaverServiceToken } from 'src/domain/ingestion/batch-saver.interface';
import { IIngestionServiceToken } from 'src/domain/ingestion/ingestion.service.interface';
import { IStreamGeneratorServiceToken } from 'src/domain/ingestion/stream-generator.interface';
import { PersistenceModule } from '../persistence/persistence.module';
import { HttpModule } from '../http/http.module';

@Module({
  imports: [PersistenceModule, HttpModule],

  providers: [
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
    IngestionScheduler,
  ],
  exports: [
    IIngestionServiceToken,
    IBatchSaverServiceToken,
    IStreamGeneratorServiceToken,
  ],
})
export class IngestionModule {}
