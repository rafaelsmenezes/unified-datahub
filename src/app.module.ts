import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from './shared/shared.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { DatasetModule } from './dataset/dataset.module';
import databaseConfig from './shared/config/database.config';
import sourcesConfig from './shared/config/sources.config';
import ingestionConfig from './shared/config/ingestion.config';

/**
 * Application Root Module
 *
 * Orchestrates the application by importing feature modules:
 * - SharedModule: Cross-cutting concerns (Database, HTTP, Sources)
 * - IngestionModule: Data ingestion from external sources
 * - DatasetModule: Data querying and retrieval
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, sourcesConfig, ingestionConfig],
    }),
    SharedModule,
    IngestionModule,
    DatasetModule,
  ],
})
export class AppModule {}
