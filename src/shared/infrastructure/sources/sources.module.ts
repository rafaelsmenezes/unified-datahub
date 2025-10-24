import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Source1Mapper } from '../../../ingestion/infrastructure/mappers/source1.mapper';
import { Source2Mapper } from '../../../ingestion/infrastructure/mappers/source2.mapper';
import { IngestionSource } from '../../../ingestion/infrastructure/interfaces/ingestion-source.interface';

export const INGESTION_SOURCES_TOKEN = 'INGESTION_SOURCES';

@Module({
  imports: [ConfigModule],
  providers: [
    Source1Mapper,
    Source2Mapper,
    {
      provide: INGESTION_SOURCES_TOKEN,
      useFactory: (
        source1Mapper: Source1Mapper,
        source2Mapper: Source2Mapper,
        configService: ConfigService,
      ): IngestionSource[] => {
        const sources: IngestionSource[] = [];

        const source1Url = configService.get<string>('sources.source1.url');
        if (source1Url) {
          sources.push({
            name:
              configService.get<string>('sources.source1.name') || 'source1',
            url: source1Url,
            mapper: source1Mapper,
          });
        }

        const source2Url = configService.get<string>('sources.source2.url');
        if (source2Url) {
          sources.push({
            name:
              configService.get<string>('sources.source2.name') || 'source2',
            url: source2Url,
            mapper: source2Mapper,
          });
        }

        return sources;
      },
      inject: [Source1Mapper, Source2Mapper, ConfigService],
    },
  ],
  exports: [INGESTION_SOURCES_TOKEN, Source1Mapper, Source2Mapper],
})
export class SourcesModule {}
