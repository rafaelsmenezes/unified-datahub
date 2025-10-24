import { FilterBuilder } from './filter-builder';
import { QueryDataDto } from '../../../interfaces/rest/dto/query-data.dto';

describe('FilterBuilder', () => {
  it('does not set empty pricePerNight when no bounds', () => {
    const q: QueryDataDto = {} as any;
    const filters = FilterBuilder.build(q);
    expect(filters.pricePerNight).toBeUndefined();
  });

  it('sets $gte and/or $lte when provided', () => {
    const q: QueryDataDto = { priceMin: 10 } as any;
    const filters = FilterBuilder.build(q);
    expect(filters.pricePerNight).toEqual({ $gte: 10 });

    const q2: QueryDataDto = { priceMax: 20 } as any;
    const filters2 = FilterBuilder.build(q2);
    expect(filters2.pricePerNight).toEqual({ $lte: 20 });

    const q3: QueryDataDto = { priceMin: 10, priceMax: 20 } as any;
    const filters3 = FilterBuilder.build(q3);
    expect(filters3.pricePerNight).toEqual({ $gte: 10, $lte: 20 });
  });
});
