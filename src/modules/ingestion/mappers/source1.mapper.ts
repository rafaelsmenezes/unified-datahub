import { SourceMapper } from './mapper.interface';

export class Source1Mapper implements SourceMapper {
  map(record: any) {
    return {
      source: 'source1',
      externalId: record.id,
      name: record.name,
      city: record.address?.city,
      country: record.address?.country,
      availability: record.isAvailable,
      pricePerNight: Number(record.priceForNight),
      raw: record,
    };
  }
}
