import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { ApiController } from './interfaces/rest/api.controller';
import { AdminController } from './interfaces/rest/admin.controller';
import { IngestionUseCase } from './application/use-cases/ingestion.usecase';
import { QueryDataUseCase } from './application/use-cases/query-data.usecase';
import { GetDataByIdUseCase } from './application/use-cases/get-data-by-id.usecase';
import {
  MongoUnifiedData,
  MongoUnifiedDataSchema,
} from './infrastructure/persistence/mongo-unified-data.schema';
import { MongoUnifiedDataRepository } from './infrastructure/persistence/mongo-unified-data.repository';
import { HttpClientService } from './infrastructure/http/http-client.service';
import { IngestionService } from './infrastructure/ingestion/ingestion.service';
import { IngestionScheduler } from './infrastructure/ingestion/ingestion.scheduler';
import { registerSources } from './sources.config';
import { IUnifiedDataRepositoryInterfaceToken } from './domain/repositories/unified-data.repository.interface';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/buenro',
    ),
    MongooseModule.forFeature([
      { name: MongoUnifiedData.name, schema: MongoUnifiedDataSchema },
    ]),
  ],
  controllers: [ApiController, AdminController],
  providers: [
    ConfigService,
    {
      provide: IUnifiedDataRepositoryInterfaceToken,
      useClass: MongoUnifiedDataRepository,
    },
    HttpClientService,
    IngestionService,
    IngestionScheduler,
    QueryDataUseCase,
    GetDataByIdUseCase,
    IngestionUseCase,
  ],
  exports: [
    {
      provide: IUnifiedDataRepositoryInterfaceToken,
      useClass: MongoUnifiedDataRepository,
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly ingestionService: IngestionService) {}

  onModuleInit() {
    registerSources(this.ingestionService, new ConfigService());
  }
}
