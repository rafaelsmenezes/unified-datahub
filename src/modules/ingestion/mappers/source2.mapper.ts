import { SourceMapper } from './mapper.interface';

export class Source2Mapper implements SourceMapper {
  map(record: any) {
    return {
      source: 'source2',
      externalId: record.id,
      city: record.city,
      availability: record.availability,
      priceSegment: record.priceSegment,
      pricePerNight: Number(record.pricePerNight),
      raw: record,
    };
  }
}
