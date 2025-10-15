import { UnifiedData } from '../entities/unified-data.entity';

export interface IUnifiedDataRepository {
  saveAll(records: UnifiedData[]): Promise<void>;
  findById(id: string): Promise<UnifiedData | null>;
  findOne(filters: Partial<UnifiedData>): Promise<UnifiedData | null>;
  findFiltered(
    filters: Partial<UnifiedData>,
    options?: {
      limit?: number;
      skip?: number;
      sort?: Record<string, 1 | -1>;
    },
  ): Promise<UnifiedData[]>;
  count(filters: Partial<UnifiedData>): Promise<number>;
}

export const IUnifiedDataRepositoryToken = Symbol('IUnifiedDataRepository');
