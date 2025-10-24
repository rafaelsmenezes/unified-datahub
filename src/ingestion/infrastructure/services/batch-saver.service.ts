import { Inject, Injectable, Logger } from '@nestjs/common';
import { UnifiedData } from '../../../ingestion/domain/entities/unified-data.entity';
import {
  IUnifiedDataRepository,
  IUnifiedDataRepositoryToken,
} from '../../../dataset/domain/repositories/unified-data.repository.interface';
import { IBatchSaverService } from 'src/ingestion/domain/interfaces/batch-saver.interface';

@Injectable()
export class BatchSaverService implements IBatchSaverService {
  private readonly logger = new Logger(BatchSaverService.name);
  private static readonly MAX_CONCURRENT_BATCHES = 3;

  constructor(
    @Inject(IUnifiedDataRepositoryToken)
    private readonly repository: IUnifiedDataRepository,
  ) {}

  async saveBatches(batches: AsyncIterable<UnifiedData[]>): Promise<void> {
    const pendingSaves: Promise<void>[] = [];

    for await (const batch of batches) {
      pendingSaves.push(this.saveBatch(batch));
      if (pendingSaves.length >= BatchSaverService.MAX_CONCURRENT_BATCHES) {
        await this.flushPending(pendingSaves);
      }
    }

    await this.flushPending(pendingSaves);
  }

  private async saveBatch(batch: UnifiedData[]): Promise<void> {
    if (!batch.length) return;
    try {
      await this.repository.saveAll(batch);
      this.logger.debug(`Saved batch of ${batch.length} records`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to save batch: ${msg}`);
    }
  }

  private async flushPending(pending: Promise<void>[]): Promise<void> {
    await Promise.allSettled(pending);
    pending.length = 0;
  }
}
