import { Inject, Injectable, Logger } from '@nestjs/common';
import { IngestionSource } from './interfaces/ingestion-source.interface';
import {
  IStreamGeneratorService,
  IStreamGeneratorServiceToken,
} from '../../domain/ingestion/stream-generator.interface';
import { IIngestionService } from '../../domain/ingestion/ingestion.service.interface';
import {
  IBatchSaverService,
  IBatchSaverServiceToken,
} from 'src/domain/ingestion/batch-saver.interface';

@Injectable()
export class IngestionService implements IIngestionService {
  private readonly sources: IngestionSource[] = [];
  private readonly logger = new Logger(IngestionService.name);
  private static readonly BATCH_SIZE = 5000;

  constructor(
    @Inject(IStreamGeneratorServiceToken)
    private readonly streamGenerator: IStreamGeneratorService,
    @Inject(IBatchSaverServiceToken)
    private readonly batchSaver: IBatchSaverService,
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
      const batchedStream = this.streamGenerator.fetch(
        url,
        mapper,
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
