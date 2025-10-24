import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infrastructure/database/database.module';
import { IngestionModule } from './infrastructure/ingestion/ingestion.module';
import { InterfacesModule } from './interfaces/interfaces.module';
import databaseConfig from './config/database.config';
import sourcesConfig from './config/sources.config';
import ingestionConfig from './config/ingestion.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, sourcesConfig, ingestionConfig],
    }),
    DatabaseModule,
    IngestionModule,
    InterfacesModule,
  ],
})
export class AppModule {}
