import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ApiModule } from '../documents/modules/api/api.module';
import { IngestionService } from './infrastructure/ingestion/ingestion.service';
import { HttpClientService } from './infrastructure/http/http-client.service';
import { MongoUnifiedDataRepository } from './infrastructure/persistence/mongo-unified-data.repository';
import { registerSources } from '../documents/modules/ingestion/setup/sources.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/buenro',
    ),
    ApiModule,
  ],
  providers: [IngestionService, HttpClientService, MongoUnifiedDataRepository],
  exports: [IngestionService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly ingestionService: IngestionService) {}

  onModuleInit() {
    // Register all ingestion sources at application startup
    registerSources(this.ingestionService);
  }
}
