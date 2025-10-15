import { Injectable, Inject, Logger } from '@nestjs/common';
import * as StreamArray from 'stream-json/streamers/StreamArray';

import { HttpClientService } from '../http/http-client.service';
import {
  IUnifiedDataRepositoryInterface,
  IUnifiedDataRepositoryInterfaceToken,
} from '../../domain/repositories/unified-data.repository.interface';
import { UnifiedData } from '../../domain/entities/unified-data.entity';
import { IngestionSource } from './interfaces/ingestion-source.interface';

@Injectable()
export class IngestionService {
  private readonly sources: IngestionSource[] = [];
  private readonly logger = new Logger(IngestionService.name);

  private static readonly BATCH_SIZE = 5000;
  private static readonly MAX_CONCURRENT_BATCHES = 3;

  constructor(
    @Inject(IUnifiedDataRepositoryInterfaceToken)
    private readonly repository: IUnifiedDataRepositoryInterface,
    private readonly httpClient: HttpClientService,
  ) {}

  registerSource(source: IngestionSource): void {
    this.sources.push(source);
  }

  async ingestAll(): Promise<void> {
    for (const source of this.sources) {
      await this.runSafely(
        () => this.ingestSource(source),
        `Failed ingestion for ${source.name}`,
      );
    }
  }

  private async ingestSource({ name, url, mapper }: IngestionSource) {
    this.logger.log(`Starting ingestion for ${name}`);

    const responseStream = await this.httpClient.getStream(url);
    const jsonStream = StreamArray.withParser();
    responseStream.pipe(jsonStream);

    const pendingSaves: Promise<void>[] = [];

    try {
      for await (const batch of this.batchedStream(jsonStream, mapper)) {
        pendingSaves.push(this.saveBatch(batch));
        if (pendingSaves.length >= IngestionService.MAX_CONCURRENT_BATCHES) {
          await this.flushPending(pendingSaves);
        }
      }

      await this.flushPending(pendingSaves);
      this.logger.log(`✅ Finished ingestion for ${name}`);
    } catch (err: unknown) {
      this.logError(`Stream ingestion failed for ${name}`, err);
    }
  }

  private async *batchedStream(
    stream: AsyncIterable<{ value: unknown }>,
    mapper: { map: (r: unknown) => UnifiedData },
    batchSize = IngestionService.BATCH_SIZE,
  ): AsyncGenerator<UnifiedData[]> {
    const batch: UnifiedData[] = [];

    for await (const { value } of stream) {
      try {
        const fullBatch = this.processItemIntoBatch(
          value,
          mapper,
          batch,
          batchSize,
        );
        if (fullBatch) yield fullBatch;
      } catch (err: unknown) {
        this.logError('Mapping failed for item', err);
      }
    }

    if (batch.length > 0) yield batch.splice(0, batch.length);
  }

  private processItemIntoBatch(
    value: unknown,
    mapper: { map: (r: unknown) => UnifiedData },
    batch: UnifiedData[],
    batchSize: number,
  ): UnifiedData[] | undefined {
    const mapped = mapper.map(value);
    if (!mapped) return undefined;
    batch.push(mapped);

    if (batch.length >= batchSize) {
      return batch.splice(0, batchSize);
    }
    return undefined;
  }

  private async saveBatch(batch: UnifiedData[]): Promise<void> {
    if (!batch.length) return;

    const errorContext = `Failed to save batch of ${batch.length} records`;
    await this.runSafely(
      () => this.repository.saveAll(batch),
      errorContext,
      false,
    );
    this.logger.debug(`Saved batch of ${batch.length} records`);
  }

  private async flushPending(pending: Promise<void>[]): Promise<void> {
    await Promise.allSettled(pending);
    pending.length = 0;
  }

  private async runSafely(
    fn: () => Promise<void>,
    context: string,
    rethrow = true,
  ) {
    try {
      await fn();
    } catch (err: unknown) {
      this.logError(context, err);
      if (rethrow) throw err;
    }
  }

  private logError(context: string, error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    this.logger.error(
      `${context}: ${message}`,
      error instanceof Error ? error.stack : undefined,
    );
  }
}
