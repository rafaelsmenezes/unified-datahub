import { SourceMapper } from '../mappers/mapper.interface';

export interface IngestionSource {
  name: string;
  url: string;
  mapper: SourceMapper;
}
