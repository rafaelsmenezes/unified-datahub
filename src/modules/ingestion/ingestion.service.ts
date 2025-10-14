import axios from 'axios';
import { pipeline } from 'stream';
import * as StreamArray from 'stream-json/streamers/StreamArray';
import { StorageService } from '../storage/storage.service';
import { IngestionSource } from './interfaces/ingestion-source.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class IngestionService {
  private readonly sources: IngestionSource[] = [];

  constructor(private readonly storage: StorageService) {}

  /** Register a new source */
  registerSource(source: IngestionSource) {
    this.sources.push(source);
  }

  /** Run ingestion for all registered sources */
  async ingestAll() {
    for (const source of this.sources) {
      await this.ingestSource(source);
    }
  }

  /** Ingest a single source via streaming */
  private async ingestSource({ name, url, mapper }: IngestionSource) {
    console.log(`Starting ingestion for ${name}`);

    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    });
    const jsonStream = StreamArray.withParser();
    const batch: any[] = [];

    await new Promise<void>((resolve, reject) => {
      pipeline(response.data, jsonStream, (err) =>
        err ? reject(err) : resolve(),
      );

      jsonStream.on('data', ({ value }) => {
        batch.push(mapper.map(value));

        if (batch.length >= 5000) {
          this.storage.bulkInsert(batch);
          batch.length = 0;
        }
      });

      jsonStream.on('end', async () => {
        if (batch.length > 0) await this.storage.bulkInsert(batch);
        console.log(`Finished ingestion for ${name}`);
        resolve();
      });
    });
  }
}
