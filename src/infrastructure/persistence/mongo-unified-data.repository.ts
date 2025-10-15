import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { UnifiedData } from '../../domain/entities/unified-data.entity';
import { MongoUnifiedData } from './mongo-unified-data.schema';
import { IUnifiedDataRepositoryInterface } from 'src/domain/repositories/unified-data.repository.interface';
import { BaseMongoRepository } from './base-mongo.repository';
import { MongoUnifiedDataMapper } from './mongo-unified-data.mapper';

@Injectable()
export class MongoUnifiedDataRepository
  extends BaseMongoRepository<MongoUnifiedData>
  implements IUnifiedDataRepositoryInterface, OnModuleInit
{
  private readonly logger = new Logger(MongoUnifiedDataRepository.name);

  constructor(
    @InjectModel(MongoUnifiedData.name)
    model: Model<MongoUnifiedData>,
  ) {
    super(model);
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
    await this.bulkUpsert(
      docs,
      (d) => ({ source: d.source!, externalId: d.externalId! }),
      session,
    );
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
      .lean();

    return MongoUnifiedDataMapper.toDomainMany(docs);
  }

  async findById(id: string): Promise<UnifiedData | null> {
    const doc = await this.model.findById(id).lean();
    return doc ? MongoUnifiedDataMapper.toDomain(doc) : null;
  }

  async findOne(filters: Partial<UnifiedData>): Promise<UnifiedData | null> {
    const doc = await this.model.findOne(filters).lean();
    return doc ? MongoUnifiedDataMapper.toDomain(doc) : null;
  }

  async count(filters: Partial<UnifiedData>): Promise<number> {
    return this.model.countDocuments(filters);
  }
}
