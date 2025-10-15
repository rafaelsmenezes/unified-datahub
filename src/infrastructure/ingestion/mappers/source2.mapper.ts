import { UnifiedData } from '../../../domain/entities/unified-data.entity';
import { SourceMapper } from '../interfaces/mapper.interface';
import {
  extractExternalId,
  asNumber,
  asBoolean,
  asString,
} from './mapper.utils';

export class Source2Mapper implements SourceMapper {
  map(record: unknown): UnifiedData {
    const rec = record as Record<string, unknown>;

    const externalId = extractExternalId(rec, 'source2');

    return UnifiedData.create({
      source: 'source2',
      externalId,
      city: asString(rec, 'city'),
      availability: asBoolean(rec, 'availability'),
      pricePerNight: asNumber(rec, 'pricePerNight'),
      priceSegment: asString(rec, 'priceSegment'),
      raw: rec,
    });
  }
}
