import { Injectable } from '@nestjs/common';
import {
  IUnifiedDataRepository,
  IUnifiedDataRepositoryToken,
} from '../../domain/repositories/unified-data.repository.interface';
import { Inject } from '@nestjs/common';
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

    // pagination defaults and constraints
    const rawLimit = query.limit ?? 100;
    const rawSkip = query.skip ?? 0;

    const limit = Math.min(Math.max(Number(rawLimit) || 0, 1), 1000);
    const skip = Math.max(Number(rawSkip) || 0, 0);

    const sort: Record<string, 1 | -1> = {};
    if (query.sortBy) sort[query.sortBy] = query.sortDir === 'asc' ? 1 : -1;
    else sort.createdAt = -1;

    const [items, total] = await Promise.all([
      this.repository.findFiltered(filters, { limit, skip, sort }),
      this.repository.count(filters),
    ]);

    return { items, meta: { total, limit, skip } };
  }
}
