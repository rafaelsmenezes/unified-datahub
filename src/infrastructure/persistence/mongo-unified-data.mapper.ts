import { UnifiedData } from '../../domain/entities/unified-data.entity';
import { MongoUnifiedData } from './mongo-unified-data.schema';

type MongoUnifiedDataLean = Omit<MongoUnifiedData, 'save' | 'remove'>;

export class MongoUnifiedDataMapper {
  /**
   * Converts a Mongo document (plain or lean) to a domain entity.
   */
  static toDomain(doc: Partial<MongoUnifiedDataLean>): UnifiedData {
    if (!doc) {
      throw new Error('Cannot map empty document to UnifiedData entity');
    }

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

  /**
   * Converts a domain entity to a plain persistence object
   * (ready for Mongo insertion / upsert).
   */
  static toPersistence(entity: UnifiedData): Record<string, any> {
    if (!entity) {
      throw new Error('Cannot map empty entity to persistence object');
    }

    return {
      source: entity.source,
      externalId: entity.externalId,
      name: entity.name,
      city: entity.city,
      country: entity.country,
      availability: entity.availability,
      pricePerNight: entity.pricePerNight,
      priceSegment: entity.priceSegment,
      raw: entity.raw,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  /**
   * Maps an array of domain entities to persistence objects.
   */
  static toPersistenceMany(entities: UnifiedData[]): Record<string, any>[] {
    return entities.map((e) => this.toPersistence(e));
  }

  /**
   * Maps an array of Mongo documents to domain entities.
   */
  static toDomainMany(docs: Partial<MongoUnifiedDataLean>[]): UnifiedData[] {
    return docs.map((d) => this.toDomain(d));
  }
}
