import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { UnifiedData } from '../../domain/entities/unified-data.entity';
import { MongoUnifiedData } from './mongo-unified-data.schema';
import { IUnifiedDataRepository } from 'src/domain/repositories/unified-data.repository.interface';
import { BaseMongoRepository } from './base-mongo.repository';
import {
  MongoUnifiedDataLean,
  MongoUnifiedDataMapper,
} from './mongo-unified-data.mapper';

@Injectable()
export class MongoUnifiedDataRepository
  implements IUnifiedDataRepository, OnModuleInit
{
  private readonly logger = new Logger(MongoUnifiedDataRepository.name);
  private readonly baseRepo: BaseMongoRepository<MongoUnifiedData>;

  constructor(
    @InjectModel(MongoUnifiedData.name)
    private readonly model: Model<MongoUnifiedData>,
  ) {
    this.baseRepo = new BaseMongoRepository(model);
  }

  async onModuleInit() {
    await this.model.syncIndexes();
    this.logger.log('✅ MongoUnifiedData indexes synchronized');
  }

  async saveAll(
    records: UnifiedData[],
    session?: ClientSession,
  ): Promise<void> {
    if (!records.length) return;
    const docs = MongoUnifiedDataMapper.toPersistenceMany(records);
    await this.baseRepo.bulkUpsert(
      docs,
      (d) => ({ source: d.source!, externalId: d.externalId! }),
      session,
    );
  }

  async findById(id: string): Promise<UnifiedData | null> {
    const doc = await this.baseRepo.findById(id);
    return doc ? MongoUnifiedDataMapper.toDomain(doc) : null;
  }

  async findOne(filters: Partial<UnifiedData>): Promise<UnifiedData | null> {
    const doc = await this.baseRepo.findOne(filters);
    return doc ? MongoUnifiedDataMapper.toDomain(doc) : null;
  }

  async findFiltered(
    filters: Partial<UnifiedData>,
    options?: {
      limit?: number;
      skip?: number;
      sort?: Record<string, 1 | -1>;
      projection?: Record<string, 0 | 1>;
    },
  ): Promise<UnifiedData[]> {
    const limit = Math.min(options?.limit ?? 25, 1000);
    const skip = options?.skip ?? 0;
    const sort = options?.sort ?? { createdAt: -1 };
    const projection = options?.projection ?? {};

    const docs = await this.model
      .find(filters, projection)
      .limit(limit)
      .skip(skip)
      .sort(sort)
      .lean<MongoUnifiedDataLean[]>();

    return MongoUnifiedDataMapper.toDomainMany(docs);
  }

  async count(filters: Partial<UnifiedData>): Promise<number> {
    return this.baseRepo.count(filters);
  }
}
