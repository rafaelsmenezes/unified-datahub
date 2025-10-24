export interface IStreamGeneratorService {
  fetch<T>(
    url: string,
    mapper: { map(record: unknown): T },
    batchSize?: number,
  ): AsyncIterable<T[]>;
}

export const IStreamGeneratorServiceToken = Symbol('IStreamGeneratorService');
