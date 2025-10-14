import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { UnifiedData } from '../../domain/entities/unified-data.entity';
import { MongoUnifiedData } from './mongo-unified-data.schema';
import { IUnifiedDataRepositoryInterface } from 'src/domain/repositories/unified-data.repository.interface';

type MongoUnifiedDataLean = Omit<MongoUnifiedData, 'save' | 'remove'>;

@Injectable()
export class MongoUnifiedDataRepository
  implements IUnifiedDataRepositoryInterface
{
  private readonly logger = new Logger(MongoUnifiedDataRepository.name);
  private static readonly BULK_CHUNK_SIZE = 1000;

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

  /** Map domain entities to persistence layer docs */
  private mapToPersistence(records: UnifiedData[]): Record<string, any>[] {
    return records.map((r) => ({
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
  }

  /** Insert or update multiple records (idempotent upsert) */
  async saveAll(
    records: UnifiedData[],
    session?: ClientSession,
  ): Promise<void> {
    if (records.length === 0) return;

    const docs = this.mapToPersistence(records);

    // Split into manageable chunks to prevent MongoDB BSON document size limits
    for (
      let i = 0;
      i < docs.length;
      i += MongoUnifiedDataRepository.BULK_CHUNK_SIZE
    ) {
      const chunk = docs.slice(
        i,
        i + MongoUnifiedDataRepository.BULK_CHUNK_SIZE,
      );

      const ops = chunk.map((doc) => ({
        updateOne: {
          filter: { source: doc.source, externalId: doc.externalId },
          update: { $set: doc },
          upsert: true,
        },
      }));

      try {
        await this.model.bulkWrite(ops, { ordered: false, session });
      } catch (error) {
        this.logger.error(
          `Bulk write failed on chunk starting at index ${i}: ${error.message}`,
        );
        // Optional: decide whether to rethrow or continue
      }
    }
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
    const limit = Math.min(options?.limit ?? 25, 1000); // add a safe upper cap
    const skip = options?.skip ?? 0;
    const sort = options?.sort ?? { createdAt: -1 };

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
