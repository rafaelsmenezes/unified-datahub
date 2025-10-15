import { SourceMapper } from './mapper.interface';

export interface IngestionSource {
  name: string;
  url: string;
  mapper: SourceMapper;
}
