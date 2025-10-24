import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  IHttpClientService,
  IHttpClientServiceToken,
} from '../../../shared/infrastructure/http/http-client.interface';
import { IStreamGeneratorService } from '../../domain/interfaces/stream-generator.interface';
import {
  batchStream,
  fetchHttpStream,
  mapStream,
} from './stream-generator.functions';

@Injectable()
export class StreamGeneratorService implements IStreamGeneratorService {
  private readonly logger = new Logger(StreamGeneratorService.name);

  constructor(
    @Inject(IHttpClientServiceToken)
    private readonly httpClient: IHttpClientService,
  ) {}

  async *fetch<T>(
    url: string,
    mapper: { map(record: unknown): T },
    batchSize = 5000,
  ): AsyncGenerator<T[]> {
    const rawStream = fetchHttpStream(url, this.httpClient, this.logger);
    const mappedStream = mapStream(rawStream, mapper, this.logger);
    yield* batchStream(mappedStream, batchSize);
  }
}
