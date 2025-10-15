import { UnifiedData } from '../../../domain/entities/unified-data.entity';
import { SourceMapper } from './mapper.interface';

export class Source2Mapper implements SourceMapper {
  map(record: unknown): UnifiedData {
    const rec = record as Record<string, unknown>;
    const externalId =
      typeof rec.id === 'string' || typeof rec.id === 'number'
        ? String(rec.id)
        : 'unknown';

    // For new records being created, we use a temporary ID
    // MongoDB will assign the actual _id when the document is saved
    return new UnifiedData(
      '', // Temporary ID, will be assigned by MongoDB
      'source2',
      externalId,
      undefined,
      typeof rec.city === 'string' ? rec.city : undefined,
      undefined,
      typeof rec.availability === 'boolean' ? rec.availability : undefined,
      rec.pricePerNight != null ? Number(rec.pricePerNight) : undefined,
      typeof rec.priceSegment === 'string' ? rec.priceSegment : undefined,
      rec,
    );
  }
}
