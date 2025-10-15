import { UnifiedData } from '../../../domain/entities/unified-data.entity';
import { MongoUnifiedData } from './mongo-unified-data.schema';

export type MongoUnifiedDataLean = Omit<MongoUnifiedData, 'save' | 'remove'>;

export class MongoUnifiedDataMapper {
  static toDomain(doc: Partial<MongoUnifiedDataLean>): UnifiedData {
    if (!doc) throw new Error('Cannot map empty document to UnifiedData');
    if (!doc._id) throw new Error('Document must have _id field');
    if (!doc.source) throw new Error('Document must have source field');
    if (!doc.externalId) throw new Error('Document must have externalId field');

    return new UnifiedData(
      doc._id.toString(),
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

  static toDomainMany(docs: Partial<MongoUnifiedDataLean>[]): UnifiedData[] {
    return docs.map((d) => this.toDomain(d));
  }

  static toPersistence(entity: UnifiedData): Record<string, any> {
    if (!entity) throw new Error('Cannot map empty entity to persistence');

    const persistence: Record<string, any> = {
      source: entity.source,
      externalId: entity.externalId,
      name: entity.name,
      city: entity.city,
      country: entity.country,
      availability: entity.availability,
      pricePerNight: entity.pricePerNight,
      priceSegment: entity.priceSegment,
      raw: entity.raw,
    };

    if (entity.id && entity.id.trim() !== '') {
      persistence._id = entity.id;
    }

    if (entity.createdAt) {
      persistence.createdAt = entity.createdAt;
    }
    if (entity.updatedAt) {
      persistence.updatedAt = entity.updatedAt;
    }

    return persistence;
  }

  static toPersistenceMany(entities: UnifiedData[]): Record<string, any>[] {
    return entities.map((e) => this.toPersistence(e));
  }
}
