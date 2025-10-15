import { UnifiedData } from '../../../domain/entities/unified-data.entity';
import { SourceMapper } from './mapper.interface';

export class Source1Mapper implements SourceMapper {
  map(record: unknown): UnifiedData {
    const rec = record as Record<string, unknown>;
    const externalId =
      typeof rec.id === 'string' || typeof rec.id === 'number'
        ? String(rec.id)
        : 'unknown';

    let city: string | undefined;
    let country: string | undefined;
    if (rec.address && typeof rec.address === 'object') {
      const addr = rec.address as Record<string, unknown>;
      city = typeof addr.city === 'string' ? addr.city : undefined;
      country = typeof addr.country === 'string' ? addr.country : undefined;
    }

    // For new records being created, we use a temporary ID
    // MongoDB will assign the actual _id when the document is saved
    return new UnifiedData(
      '', // Temporary ID, will be assigned by MongoDB
      'source1',
      externalId,
      typeof rec.name === 'string' ? rec.name : undefined,
      city,
      country,
      typeof rec.isAvailable === 'boolean' ? rec.isAvailable : undefined,
      rec.priceForNight != null ? Number(rec.priceForNight) : undefined,
      undefined,
      rec,
    );
  }
}
