import { Injectable } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { QueryDataDto } from './dto/query-data.dto';
import { FilterQuery } from 'mongoose';

@Injectable()
export class ApiService {
  constructor(private readonly storage: StorageService) {}

  buildFilters(query: QueryDataDto): FilterQuery<any> {
    const filters: any = {};

    // exact source match
    if (query.source) filters.source = query.source;

    // availability strict boolean
    if (typeof query.availability === 'boolean')
      filters.availability = query.availability;

    // price numeric range
    if (query.priceMin !== undefined || query.priceMax !== undefined) {
      filters.pricePerNight = {};
      if (query.priceMin !== undefined)
        filters.pricePerNight.$gte = query.priceMin;
      if (query.priceMax !== undefined)
        filters.pricePerNight.$lte = query.priceMax;
    }

    // exact segment
    if (query.priceSegment) filters.priceSegment = query.priceSegment;

    // partial city match (case-insensitive)
    if (query.city) filters.city = { $regex: query.city, $options: 'i' };

    // text / broad search: use text index if available, fallback to regex on name/city/raw
    if (query.q) {
      // prefer using $text if index exists – StorageService will detect or we can rely on it
      filters.$or = [
        { name: { $regex: query.q, $options: 'i' } },
        { city: { $regex: query.q, $options: 'i' } },
        { raw: { $regex: query.q, $options: 'i' } },
      ];
    }

    return filters;
  }

  async queryData(query: QueryDataDto) {
    const filters = this.buildFilters(query);

    // Sorting
    const sort: any = {};
    if (query.sortBy) {
      const dir = query.sortDir === 'asc' ? 1 : -1;
      sort[query.sortBy] = dir;
    } else {
      sort.createdAt = -1; // default: newest first
    }

    // Limit guard
    const limit = Math.min(query.limit || 25, 200);
    const skip = query.skip || 0;

    // StorageService abstracts Mongoose model
    const [items, total] = await Promise.all([
      this.storage.findFiltered(filters, { limit, skip, sort }),
      this.storage.count(filters),
    ]);

    return {
      items,
      meta: { total, limit, skip },
    };
  }

  async findByIdOrExternal(id: string) {
    // Try _id first, then externalId
    const byId = await this.storage.findById(id);
    if (byId) return byId;
    return this.storage.findOne({ externalId: id });
  }
}
