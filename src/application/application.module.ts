import { Module } from '@nestjs/common';
import { IngestionUseCase } from './use-cases/ingestion.usecase';
import { QueryDataUseCase } from './use-cases/query-data.usecase';
import { GetDataByIdUseCase } from './use-cases/get-data-by-id.usecase';

@Module({
  providers: [IngestionUseCase, QueryDataUseCase, GetDataByIdUseCase],
  exports: [IngestionUseCase, QueryDataUseCase, GetDataByIdUseCase],
})
export class ApplicationModule {}
