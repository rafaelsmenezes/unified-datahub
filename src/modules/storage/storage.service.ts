import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UnifiedData } from './unified-data.schema';

@Injectable()
export class StorageService {
  constructor(
    @InjectModel(UnifiedData.name) private readonly model: Model<UnifiedData>,
  ) {}

  async bulkInsert(records: any[]) {
    if (!records.length) return;
    // consider upsert later — currently raw insertMany
    await this.model.insertMany(records, { ordered: false });
  }

  async findFiltered(
    filters: any,
    opts: { limit: number; skip: number; sort: any },
  ) {
    return this.model
      .find(filters)
      .limit(opts.limit)
      .skip(opts.skip)
      .sort(opts.sort)
      .lean();
  }

  async count(filters: any) {
    return this.model.countDocuments(filters);
  }

  async findById(id: string) {
    return this.model.findById(id).lean();
  }

  async findOne(filters: any) {
    return this.model.findOne(filters).lean();
  }
}
