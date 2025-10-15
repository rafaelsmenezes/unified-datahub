import { UnifiedData } from '../entities/unified-data.entity';

export interface IBatchSaverService {
  saveBatches(batches: AsyncIterable<UnifiedData[]>): Promise<void>;
}

export const IBatchSaverServiceToken = Symbol('IBatchSaverService');
