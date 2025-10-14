// src/infrastructure/ingestion/mappers/source1.mapper.ts
import { SourceMapper } from './mapper.interface';
import { UnifiedData } from '../../../domain/entities/unified-data.entity';

export class Source1Mapper implements SourceMapper {
  map(record: any): UnifiedData {
    return new UnifiedData(
      'source1',
      record.id,
      record.name,
      record.address?.city,
      record.address?.country,
      record.isAvailable,
      Number(record.priceForNight),
      undefined,
      record,
    );
  }
}
