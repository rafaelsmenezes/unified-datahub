import { Global, Module } from '@nestjs/common';
import { DatabaseModule } from './infrastructure/database/database.module';
import { HttpModule } from './infrastructure/http/http.module';
import { SourcesModule } from './infrastructure/sources/sources.module';

/**
 * Shared Module
 *
 * Provides cross-cutting concerns and shared infrastructure.
 *
 * - Database connection (MongoDB)
 * - HTTP client for external APIs
 * - Data source configuration
 *
 * This module is marked as @Global() so its exports are available
 * everywhere without explicit import.
 */
@Global()
@Module({
  imports: [DatabaseModule, HttpModule, SourcesModule],
  exports: [DatabaseModule, HttpModule, SourcesModule],
})
export class SharedModule {}
