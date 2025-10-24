import { ValidationPipe } from '@nestjs/common';
import { QueryDataDto } from '../../../interfaces/rest/dto/query-data.dto';
import { FilterBuilder } from './filter-builder';

describe('QueryDataDto transform + FilterBuilder', () => {
  it('transforms query strings to typed DTO and builds filter', async () => {
    const raw = {
      priceMin: '150',
      limit: '10',
      availability: 'true',
      city: 'Paris',
    } as any;

    const pipe = new ValidationPipe({ transform: true });
    const transformed = (await pipe.transform(raw, {
      type: 'query',
      metatype: QueryDataDto as any,
    })) as QueryDataDto;

    expect(typeof transformed.priceMin).toBe('number');
    expect(typeof transformed.limit).toBe('number');
    expect(typeof transformed.availability).toBe('boolean');

    const filters = FilterBuilder.build(transformed);
    expect(filters.pricePerNight).toEqual({ $gte: 150 });
    expect(filters.city).toBeDefined();
    expect(filters.availability).toBe(true);
  });
});
