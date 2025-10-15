import { IIngestionService } from 'src/domain/ingestion/ingestion.service.interface';
import { Source1Mapper } from 'src/infrastructure/ingestion/mappers/source1.mapper';
import { Source2Mapper } from 'src/infrastructure/ingestion/mappers/source2.mapper';
import { ConfigService } from '@nestjs/config';

function getRequiredEnv(key: string, configService: ConfigService): string {
  const value = configService.get<string>(key);
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

export function registerSources(
  ingestionService: IIngestionService,
  configService: ConfigService,
) {
  ingestionService.registerSource({
    name: 'source1',
    url: getRequiredEnv('SOURCE1_URL', configService),
    mapper: new Source1Mapper(),
  });

  ingestionService.registerSource({
    name: 'source2',
    url: getRequiredEnv('SOURCE2_URL', configService),
    mapper: new Source2Mapper(),
  });
}
