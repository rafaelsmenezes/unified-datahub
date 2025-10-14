// src/infrastructure/ingestion/setup/sources.config.ts
import { IngestionService } from '../ingestion.service';
import { Source1Mapper } from '../mappers/source1.mapper';
import { Source2Mapper } from '../mappers/source2.mapper';

export function registerSources(ingestionService: IngestionService) {
  ingestionService.registerSource({
    name: 'source1',
    url: 'https://buenro-tech-assessment-materials.s3.eu-north-1.amazonaws.com/structured_generated_data.json',
    mapper: new Source1Mapper(),
  });

  ingestionService.registerSource({
    name: 'source2',
    url: 'https://buenro-tech-assessment-materials.s3.eu-north-1.amazonaws.com/large_generated_data.json',
    mapper: new Source2Mapper(),
  });
}
