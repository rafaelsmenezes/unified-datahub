import { SourceMapper } from './mapper.interface';
import { UnifiedData } from '../../../domain/entities/unified-data.entity';

export class Source2Mapper implements SourceMapper {
  map(record: any): UnifiedData {
    return new UnifiedData(
      'source2',
      record.id,
      undefined,
      record.city,
      undefined,
      record.availability,
      Number(record.pricePerNight),
      record.priceSegment,
      record,
    );
  }
}
