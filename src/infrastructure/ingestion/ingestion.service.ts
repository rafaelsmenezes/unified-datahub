import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IngestionSource } from './interfaces/ingestion-source.interface';
import { INGESTION_SOURCES_TOKEN } from '../sources/sources.module';
import {
  IStreamGeneratorService,
  IStreamGeneratorServiceToken,
} from '../../domain/ingestion/stream-generator.interface';
import { IIngestionService } from '../../domain/ingestion/ingestion.service.interface';
import {
  IBatchSaverService,
  IBatchSaverServiceToken,
} from '../../domain/ingestion/batch-saver.interface';

@Injectable()
export class IngestionService implements IIngestionService {
  private readonly logger = new Logger(IngestionService.name);
  private readonly batchSize: number;

  constructor(
    @Inject(INGESTION_SOURCES_TOKEN)
    private readonly sources: IngestionSource[],
    @Inject(IStreamGeneratorServiceToken)
    private readonly streamGenerator: IStreamGeneratorService,
    @Inject(IBatchSaverServiceToken)
    private readonly batchSaver: IBatchSaverService,
    private readonly configService: ConfigService,
  ) {
    this.batchSize =
      this.configService.get<number>('ingestion.batchSize') || 5000;
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
        this.batchSize,
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
