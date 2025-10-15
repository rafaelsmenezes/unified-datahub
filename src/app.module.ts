import { Module, OnModuleInit, Inject } from '@nestjs/common';
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
import { BatchSaverService } from './infrastructure/ingestion/batch-saver.service';
import { IngestionScheduler } from './infrastructure/ingestion/ingestion.scheduler';
import { registerSources } from './sources.config';
import { IUnifiedDataRepositoryToken } from './domain/repositories/unified-data.repository.interface';
import {
  IIngestionService,
  IIngestionServiceToken,
} from './domain/ingestion/ingestion.service.interface';

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
      provide: IUnifiedDataRepositoryToken,
      useClass: MongoUnifiedDataRepository,
    },
    {
      provide: IIngestionServiceToken,
      useClass: IngestionService,
    },
    HttpClientService,
    BatchSaverService,

    IngestionScheduler,
    QueryDataUseCase,
    GetDataByIdUseCase,
    IngestionUseCase,
  ],
  exports: [
    {
      provide: IUnifiedDataRepositoryToken,
      useClass: MongoUnifiedDataRepository,
    },
    {
      provide: IIngestionServiceToken,
      useClass: IngestionService,
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    @Inject(IIngestionServiceToken)
    private readonly ingestionService: IIngestionService,
  ) {}

  onModuleInit() {
    registerSources(this.ingestionService, new ConfigService());
  }
}
