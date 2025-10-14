import { UnifiedData } from '../../../domain/entities/unified-data.entity';
import { SourceMapper } from './mapper.interface';

export class Source1Mapper implements SourceMapper {
  map(record: unknown): UnifiedData {
    // Defensive mapping with runtime checks
    const rec = record as Record<string, unknown>;
    const id =
      typeof rec.id === 'string' || typeof rec.id === 'number'
        ? String(rec.id)
        : undefined;
    const name = typeof rec.name === 'string' ? rec.name : undefined;
    let city: string | undefined;
    let country: string | undefined;
    if (rec.address && typeof rec.address === 'object') {
      const addr = rec.address as Record<string, unknown>;
      city = typeof addr.city === 'string' ? addr.city : undefined;
      country = typeof addr.country === 'string' ? addr.country : undefined;
    }
    const availability =
      typeof rec.isAvailable === 'boolean' ? rec.isAvailable : undefined;
    const price =
      rec.priceForNight != null ? Number(rec.priceForNight as any) : undefined;

    return new UnifiedData(
      'source1',
      id,
      name,
      city,
      country,
      availability,
      price,
      undefined,
      rec,
    );
  }
}
