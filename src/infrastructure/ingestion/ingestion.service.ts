import { Injectable, Logger } from '@nestjs/common';
import { IngestionSource } from './interfaces/ingestion-source.interface';
import { HttpClientService } from '../http/http-client.service';
import { BatchSaverService } from './batch-saver.service';
import {
  batchStream,
  fetchHttpStream,
  mapStream,
} from './stream-generator.service';
import { IIngestionService } from '../../domain/ingestion/ingestion.service.interface';

@Injectable()
export class IngestionService implements IIngestionService {
  private readonly sources: IngestionSource[] = [];
  private readonly logger = new Logger(IngestionService.name);
  private static readonly BATCH_SIZE = 5000;

  constructor(
    private readonly httpClient: HttpClientService,
    private readonly batchSaver: BatchSaverService,
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

    try {
      const batchedStream = batchStream(
        mapStream(
          fetchHttpStream(url, this.httpClient, this.logger),
          mapper,
          this.logger,
        ),
        IngestionService.BATCH_SIZE,
      );

      await this.batchSaver.saveBatches(batchedStream);

      this.logger.log(`✅ Finished ingestion for ${name}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Ingestion failed for ${name}: ${msg}`);
    }
  }

  private async runSafely(fn: () => Promise<void>, context: string) {
    try {
      await fn();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`${context}: ${msg}`);
    }
  }
}
