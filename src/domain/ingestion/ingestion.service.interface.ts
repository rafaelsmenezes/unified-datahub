import { IngestionSource } from 'src/infrastructure/ingestion/interfaces/ingestion-source.interface';

export interface IIngestionService {
  registerSource(source: IngestionSource): void;
  ingestAll(): Promise<void>;
}

export const IIngestionServiceToken = Symbol('IIngestionService');
