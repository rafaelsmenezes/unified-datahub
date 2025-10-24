import { Source2Mapper } from './source2.mapper';
import { UnifiedData } from '../../../ingestion/domain/entities/unified-data.entity';

describe('Source2Mapper', () => {
  const mapper = new Source2Mapper();

  it('maps record to UnifiedData with expected fields', () => {
    const rec = {
      id: 'x1',
      city: 'Porto',
      availability: false,
      pricePerNight: 80,
      priceSegment: 'budget',
    } as unknown;

    const out = mapper.map(rec);
    expect(out).toBeInstanceOf(UnifiedData);
    expect(out.externalId).toBe('x1');
    expect(out.city).toBe('Porto');
    expect(out.availability).toBe(false);
    expect(out.pricePerNight).toBe(80);
    expect(out.priceSegment).toBe('budget');
  });

  it('generates externalId when missing', () => {
    const out = mapper.map({} as any);
    expect(out.externalId.startsWith('missing-source2-')).toBe(true);
  });
});
