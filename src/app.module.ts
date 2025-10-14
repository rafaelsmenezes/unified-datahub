import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IngestionModule } from './modules/ingestion/ingestion.module';
import { StorageModule } from './modules/storage/storage.module';
import { ApiModule } from './modules/api/api.module';
import { IngestionService } from './modules/ingestion/ingestion.service';
import { registerSources } from './modules/ingestion/setup/sources.config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/buenro',
    ),
    IngestionModule,
    StorageModule,
    ApiModule,
  ],
})
export class AppModule {
  constructor(private readonly ingestionService: IngestionService) {}

  onModuleInit() {
    // Register all ingestion sources at application startup
    registerSources(this.ingestionService);
  }
}
