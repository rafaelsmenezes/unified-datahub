import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoUnifiedDataRepository } from './infrastructure/persistence/repository/mongo-unified-data.repository';
import {
  MongoUnifiedData,
  MongoUnifiedDataSchema,
} from './infrastructure/persistence/models/mongo-unified-data.schema';
import { IUnifiedDataRepositoryToken } from './domain/repositories/unified-data.repository.interface';

import { QueryDataUseCase } from './application/use-cases/query-data.usecase';
import { GetDataByIdUseCase } from './application/use-cases/get-data-by-id.usecase';
import { DataController } from './interfaces/rest/data.controller';

/**
 * Dataset Module
 *
 * Responsible for querying and retrieving stored data.
 *
 * Domain: Data querying and retrieval
 * - Query unified data with filters
 * - Retrieve data by ID
 * - MongoDB persistence layer
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MongoUnifiedData.name, schema: MongoUnifiedDataSchema },
    ]),
  ],
  controllers: [DataController],
  providers: [
    // Repository
    {
      provide: IUnifiedDataRepositoryToken,
      useClass: MongoUnifiedDataRepository,
    },

    // Use Cases
    QueryDataUseCase,
    GetDataByIdUseCase,
  ],
  exports: [IUnifiedDataRepositoryToken, QueryDataUseCase, GetDataByIdUseCase],
})
export class DatasetModule {}
