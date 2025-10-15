import { UnifiedData } from '../../../domain/entities/unified-data.entity';
import { SourceMapper } from './mapper.interface';

export class Source2Mapper implements SourceMapper {
  map(record: unknown): UnifiedData {
    const rec = record as Record<string, unknown>;
    const externalId =
      typeof rec.id === 'string' || typeof rec.id === 'number'
        ? String(rec.id)
        : 'unknown';

    return UnifiedData.create({
      source: 'source2',
      externalId,
      city: typeof rec.city === 'string' ? rec.city : undefined,
      availability:
        typeof rec.availability === 'boolean' ? rec.availability : undefined,
      pricePerNight:
        rec.pricePerNight != null ? Number(rec.pricePerNight) : undefined,
      priceSegment:
        typeof rec.priceSegment === 'string' ? rec.priceSegment : undefined,
      raw: rec,
    });
  }
}
