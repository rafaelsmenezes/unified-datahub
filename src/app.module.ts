import { Module, OnModuleInit, Inject } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { IngestionModule } from './infrastructure/ingestion/ingestion.module';
import { PersistenceModule } from './infrastructure/persistence/persistence.module';
import { IngestionUseCase } from './application/use-cases/ingestion.usecase';
import { QueryDataUseCase } from './application/use-cases/query-data.usecase';
import { GetDataByIdUseCase } from './application/use-cases/get-data-by-id.usecase';
import {
  IIngestionService,
  IIngestionServiceToken,
} from './domain/ingestion/ingestion.service.interface';
import { registerSources } from './sources.config';
import { InterfacesModule } from './interfaces/interfaces.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(String(process.env.MONGO_URI)),
    PersistenceModule,
    IngestionModule,
    InterfacesModule,
  ],
  providers: [
    ConfigService,
    IngestionUseCase,
    QueryDataUseCase,
    GetDataByIdUseCase,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    @Inject(IIngestionServiceToken)
    private readonly ingestionService: IIngestionService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    registerSources(this.ingestionService, this.configService);
  }
}
