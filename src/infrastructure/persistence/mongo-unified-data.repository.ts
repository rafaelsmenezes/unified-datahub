import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UnifiedData } from '../../domain/entities/unified-data.entity';
import { UnifiedDataRepositoryInterface } from '../../domain/repositories/unified-data.repository.interface';
import { UnifiedDataSchema as UnifiedDataMongoDocument } from './mongo-unified-data.schema';

@Injectable()
export class MongoUnifiedDataRepository
  implements UnifiedDataRepositoryInterface
{
  constructor(
    @InjectModel(UnifiedDataMongoDocument.name)
    private readonly model: Model<UnifiedDataMongoDocument>,
  ) {}

  /** Map a Mongo document to domain entity */
  private mapToEntity(doc: UnifiedDataMongoDocument): UnifiedData {
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
      doc.createdAt,
      doc.updatedAt,
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
    const doc = await this.model.findById(id).lean();
    return doc ? this.mapToEntity(doc as UnifiedDataMongoDocument) : null;
  }

  /** Find one matching record */
  async findOne(filters: Partial<UnifiedData>): Promise<UnifiedData | null> {
    const doc = await this.model.findOne(filters).lean();
    return doc ? this.mapToEntity(doc as UnifiedDataMongoDocument) : null;
  }

  /** Find multiple records with optional pagination & sorting */
  async findFiltered(
    filters: Partial<UnifiedData>,
    options?: {
      limit?: number;
      skip?: number;
      sort?: Record<string, 'asc' | 'desc'>;
    },
  ): Promise<UnifiedData[]> {
    const limit = options?.limit ?? 25;
    const skip = options?.skip ?? 0;
    const sort = options?.sort ?? { createdAt: -1 };

    const docs = await this.model
      .find(filters)
      .limit(limit)
      .skip(skip)
      .sort(sort)
      .lean();
    return docs.map((doc) => this.mapToEntity(doc as UnifiedDataMongoDocument));
  }

  /** Count documents matching filters */
  async count(filters: Partial<UnifiedData>): Promise<number> {
    return this.model.countDocuments(filters);
  }
}
