import { Injectable } from '@nestjs/common';
import { UnifiedData } from '../../../ingestion/domain/entities/unified-data.entity';
import { SourceMapper } from '../interfaces/mapper.interface';
import {
  extractExternalId,
  asNumber,
  asBoolean,
  fromAddress,
  asString,
} from './utils/mapper.utils';

@Injectable()
export class Source1Mapper implements SourceMapper {
  map(record: unknown): UnifiedData {
    const rec = record as Record<string, unknown>;

    const externalId = extractExternalId(rec, 'source1');
    const { city, country } = fromAddress(rec);

    const name = asString(rec, 'name');
    const availability = asBoolean(rec, 'isAvailable');
    const pricePerNight = asNumber(rec, 'priceForNight');

    return UnifiedData.create({
      source: 'source1',
      externalId,
      name,
      city,
      country,
      availability,
      pricePerNight,
      raw: rec,
    });
  }
}
