import { SourceMapper } from './mapper.interface';
import { UnifiedData } from '../../../domain/entities/unified-data.entity';

export class Source2Mapper implements SourceMapper {
  map(record: unknown): UnifiedData {
    const rec = record as Record<string, unknown>;
    const id =
      typeof rec.id === 'string' || typeof rec.id === 'number'
        ? String(rec.id)
        : undefined;
    const city = typeof rec.city === 'string' ? rec.city : undefined;
    const availability =
      typeof rec.availability === 'boolean' ? rec.availability : undefined;
    const price =
      rec.pricePerNight != null ? Number(rec.pricePerNight as any) : undefined;
    const priceSegment =
      typeof rec.priceSegment === 'string' ? rec.priceSegment : undefined;

    return new UnifiedData(
      'source2',
      id,
      undefined,
      city,
      undefined,
      availability,
      price,
      priceSegment,
      rec,
    );
  }
}
