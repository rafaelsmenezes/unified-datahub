import { UnifiedData } from '../../../domain/entities/unified-data.entity';
import { SourceMapper } from './mapper.interface';

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
