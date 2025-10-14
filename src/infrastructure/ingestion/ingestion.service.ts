import { Injectable, Logger } from '@nestjs/common';
import { HttpClientService } from '../http/http-client.service';
import type { UnifiedDataRepositoryInterface } from '../../domain/repositories/unified-data.repository.interface';
import { UnifiedData } from '../../domain/entities/unified-data.entity';
import { pipeline } from 'stream';
import * as StreamArray from 'stream-json/streamers/StreamArray';
import { IngestionSource } from 'documents/modules/ingestion/interfaces/ingestion-source.interface';

@Injectable()
export class IngestionService {
  private readonly sources: IngestionSource[] = [];
  private readonly logger = new Logger(IngestionService.name);
  private readonly BATCH_SIZE = 5000;
  private readonly MAX_CONCURRENT_BATCHES = 3;

  constructor(
    private readonly httpClient: HttpClientService,
    private readonly repository: UnifiedDataRepositoryInterface,
  ) {}

  registerSource(source: IngestionSource) {
    this.sources.push(source);
  }

  async ingestAll() {
    for (const source of this.sources) {
      await this.ingestSource(source);
    }
  }

  private async ingestSource({ name, url, mapper }: IngestionSource) {
    this.logger.log(`Starting ingestion for ${name}`);
    const stream = await this.httpClient.getStream(url);
    const jsonStream = StreamArray.withParser();
    const batch: UnifiedData[] = [];
    const pendingSaves: Promise<void>[] = [];

    await new Promise<void>((resolve, reject) => {
      pipeline(stream, jsonStream, (err) => (err ? reject(err) : resolve()));

      jsonStream.on('data', ({ value }) => {
        batch.push(mapper.map(value));

        if (batch.length >= this.BATCH_SIZE) {
          pendingSaves.push(this.saveBatch(batch.splice(0, this.BATCH_SIZE)));
          if (pendingSaves.length >= this.MAX_CONCURRENT_BATCHES) {
            jsonStream.pause();
            Promise.allSettled(pendingSaves).then(() => {
              pendingSaves.length = 0;
              jsonStream.resume();
            });
          }
        }
      });

      jsonStream.on('end', async () => {
        if (batch.length > 0) {
          pendingSaves.push(this.saveBatch(batch.splice(0, batch.length)));
        }
        await Promise.allSettled(pendingSaves);
        this.logger.log(`Finished ingestion for ${name}`);
        resolve();
      });

      jsonStream.on('error', (err) => reject(err));
    });
  }

  private async saveBatch(batch: UnifiedData[]) {
    if (!batch.length) return;
    await this.repository.saveAll(batch);
  }
}
