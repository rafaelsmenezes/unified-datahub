import { Module } from '@nestjs/common';
import { IngestionUseCase } from './use-cases/ingestion.usecase';
import { QueryDataUseCase } from './use-cases/query-data.usecase';
import { GetDataByIdUseCase } from './use-cases/get-data-by-id.usecase';
import { IngestionModule } from '../infrastructure/ingestion/ingestion.module';
import { PersistenceModule } from '../infrastructure/persistence/persistence.module';

@Module({
  imports: [IngestionModule, PersistenceModule],
  providers: [IngestionUseCase, QueryDataUseCase, GetDataByIdUseCase],
  exports: [IngestionUseCase, QueryDataUseCase, GetDataByIdUseCase],
})
export class ApplicationModule {}
