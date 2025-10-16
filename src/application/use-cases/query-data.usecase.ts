import { Injectable, Inject } from '@nestjs/common';
import {
  IUnifiedDataRepository,
  IUnifiedDataRepositoryToken,
} from '../../domain/repositories/unified-data.repository.interface';
import { QueryDataDto } from '../../interfaces/rest/dto/query-data.dto';
import { FilterBuilder } from './utils/filter-builder';

@Injectable()
export class QueryDataUseCase {
  constructor(
    @Inject(IUnifiedDataRepositoryToken)
    private readonly repository: IUnifiedDataRepository,
  ) {}

  async execute(query: QueryDataDto) {
    const filters = FilterBuilder.build(query);
    const { limit, skip, sort } = this.buildQueryOptions(query);

    const [items, total] = await Promise.all([
      this.repository.findFiltered(filters, { limit, skip, sort }),
      this.repository.count(filters),
    ]);

    return { items, meta: { total, limit, skip } };
  }

  private buildQueryOptions(query: QueryDataDto) {
    const rawLimit = Number(query.limit) || 100;
    const rawSkip = Number(query.skip) || 0;

    const limit = Math.min(Math.max(rawLimit, 1), 1000);
    const skip = Math.max(rawSkip, 0);

    const sort: Record<string, 1 | -1> = {};
    if (query.sortBy) {
      sort[query.sortBy] = query.sortDir === 'asc' ? 1 : -1;
    } else {
      sort.createdAt = -1;
    }

    return { limit, skip, sort };
  }
}
