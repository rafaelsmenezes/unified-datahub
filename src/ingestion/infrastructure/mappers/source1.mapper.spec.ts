import { Source1Mapper } from './source1.mapper';
import { UnifiedData } from '../../../ingestion/domain/entities/unified-data.entity';

describe('Source1Mapper', () => {
  const mapper = new Source1Mapper();

  it('maps a full record to UnifiedData', () => {
    const record = {
      id: 'ext-123',
      name: 'My Place',
      isAvailable: true,
      priceForNight: '150',
      address: { city: 'Lisbon', country: 'PT' },
    } as unknown;

    const result = mapper.map(record);

    expect(result).toBeInstanceOf(UnifiedData);
    expect(result.source).toBe('source1');
    expect(result.externalId).toBe('ext-123');
    expect(result.name).toBe('My Place');
    expect(result.availability).toBe(true);
    expect(result.pricePerNight).toBe(150);
    expect(result.city).toBe('Lisbon');
    expect(result.country).toBe('PT');
    expect(result.raw).toBe(record as Record<string, unknown>);
  });

  it('generates externalId when id missing', () => {
    const record = { name: 'NoId' } as unknown;
    const result = mapper.map(record);
    expect(typeof result.externalId).toBe('string');
    expect(result.externalId.startsWith('missing-source1-')).toBe(true);
  });

  it('handles non-numeric price and non-boolean availability', () => {
    const record = {
      id: 'i2',
      priceForNight: 'abc',
      isAvailable: 'yes',
      address: { city: 'C', country: 'X' },
    } as unknown;

    const r = mapper.map(record);
    expect(r.pricePerNight).toBeUndefined();
    expect(r.availability).toBeUndefined();
  });

  it('handles unexpected address shapes gracefully', () => {
    const record = {
      id: 'x1',
      address: 'not-an-object',
      priceForNight: 100,
    } as unknown;

    const r = mapper.map(record);
    expect(r.city).toBeUndefined();
    expect(r.country).toBeUndefined();
  });

  it('rejects negative pricePerNight in UnifiedData.create', () => {
    const bad = { id: 'p1', priceForNight: -10 } as unknown;
    expect(() => mapper.map(bad)).toThrow();
  });
});
