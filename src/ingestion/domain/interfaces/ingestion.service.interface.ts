export interface IIngestionService {
  ingestAll(): Promise<void>;
}

export const IIngestionServiceToken = Symbol('IIngestionService');
