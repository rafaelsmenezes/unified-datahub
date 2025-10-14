import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UnifiedData } from '../../domain/entities/unified-data.entity';
import { UnifiedDataRepositoryInterface } from '../../domain/repositories/unified-data.repository.interface';
import { MongoUnifiedData } from './mongo-unified-data.schema';

type MongoUnifiedDataLean = Omit<MongoUnifiedData, 'save' | 'remove'>;

@Injectable()
export class MongoUnifiedDataRepository
  implements UnifiedDataRepositoryInterface
{
  constructor(
    @InjectModel(MongoUnifiedData.name)
    private readonly model: Model<MongoUnifiedData>,
  ) {}

  /** Map a Mongo plain object to domain entity */
  private mapToEntity(doc: Partial<MongoUnifiedDataLean>): UnifiedData {
    return new UnifiedData(
      doc.source,
      doc.externalId,
      doc.name,
      doc.city,
      doc.country,
      doc.availability,
      doc.pricePerNight,
      doc.priceSegment,
      doc.raw,
      doc.createdAt ?? new Date(),
      doc.updatedAt ?? new Date(),
    );
  }

  /** Insert multiple records */
  async saveAll(records: UnifiedData[]): Promise<void> {
    if (!records.length) return;

    const docs = records.map((r) => ({
      source: r.source,
      externalId: r.externalId,
      name: r.name,
      city: r.city,
      country: r.country,
      availability: r.availability,
      pricePerNight: r.pricePerNight,
      priceSegment: r.priceSegment,
      raw: r.raw,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    await this.model.insertMany(docs, { ordered: false });
  }

  /** Find by Mongo _id */
  async findById(id: string): Promise<UnifiedData | null> {
    const doc = await this.model.findById(id).lean<MongoUnifiedDataLean>();
    return doc ? this.mapToEntity(doc) : null;
  }

  /** Find one matching record */
  async findOne(filters: Partial<UnifiedData>): Promise<UnifiedData | null> {
    const doc = await this.model.findOne(filters).lean<MongoUnifiedDataLean>();
    return doc ? this.mapToEntity(doc) : null;
  }

  /** Find multiple records with optional pagination & sorting */
  async findFiltered(
    filters: Partial<UnifiedData>,
    options?: {
      limit?: number;
      skip?: number;
      sort?: Record<string, 1 | -1>;
    },
  ): Promise<UnifiedData[]> {
    const limit = options?.limit ?? 25;
    const skip = options?.skip ?? 0;

    const sort: Record<string, 1 | -1> = options?.sort ?? { createdAt: -1 };

    const docs = await this.model
      .find(filters)
      .limit(limit)
      .skip(skip)
      .sort(sort)
      .lean<MongoUnifiedDataLean[]>();

    return docs.map((doc) => this.mapToEntity(doc));
  }

  /** Count documents matching filters */
  async count(filters: Partial<UnifiedData>): Promise<number> {
    return this.model.countDocuments(filters);
  }
}
