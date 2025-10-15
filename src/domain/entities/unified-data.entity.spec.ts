import { UnifiedData } from './unified-data.entity';

describe('UnifiedData', () => {
  it('create sets fields and returns an instance', () => {
    const raw = { foo: 'bar' };
    const dto = UnifiedData.create({
      source: 'booking',
      externalId: 'ext-123',
      name: 'Hotel A',
      city: 'City',
      country: 'Country',
      availability: true,
      pricePerNight: 120,
      priceSegment: 'mid',
      raw,
    });

    expect(dto).toBeInstanceOf(UnifiedData);
    expect(dto.id).toBe(''); // repository is expected to set this later
    expect(dto.source).toBe('booking');
    expect(dto.externalId).toBe('ext-123');
    expect(dto.name).toBe('Hotel A');
    expect(dto.city).toBe('City');
    expect(dto.country).toBe('Country');
    expect(dto.availability).toBe(true);
    expect(dto.pricePerNight).toBe(120);
    expect(dto.priceSegment).toBe('mid');
    expect(dto.raw).toBe(raw);
    expect(dto.createdAt).toBeUndefined();
    expect(dto.updatedAt).toBeUndefined();
  });

  it('create allows undefined pricePerNight', () => {
    const dto = UnifiedData.create({
      source: 'src',
      externalId: 'eid',
    });
    expect(dto.pricePerNight).toBeUndefined();
  });

  it('create throws when pricePerNight is negative', () => {
    expect(() =>
      UnifiedData.create({
        source: 'src',
        externalId: 'eid',
        pricePerNight: -5,
      }),
    ).toThrow('pricePerNight cannot be negative');
  });

  it('constructor throws when source is missing', () => {
    expect(() => new UnifiedData('id', '', 'ext')).toThrow(
      'UnifiedData must have a source',
    );
  });

  it('constructor throws when externalId is missing', () => {
    expect(() => new UnifiedData('id', 'src', '')).toThrow(
      'UnifiedData must have an externalId',
    );
  });

  it('withId returns a new instance with the new id and preserves other fields', () => {
    const raw = { a: 1 };
    const createdAt = new Date('2020-01-01T00:00:00.000Z');
    const updatedAt = new Date('2020-02-02T00:00:00.000Z');

    const original = new UnifiedData(
      'old-id',
      'src',
      'ext',
      'Name',
      'City',
      'Country',
      false,
      50,
      'low',
      raw,
      createdAt,
      updatedAt,
    );

    const withNewId = original.withId('new-id');

    expect(withNewId).toBeInstanceOf(UnifiedData);
    expect(withNewId).not.toBe(original);
    expect(withNewId.id).toBe('new-id');

    // other fields preserved
    expect(withNewId.source).toBe(original.source);
    expect(withNewId.externalId).toBe(original.externalId);
    expect(withNewId.name).toBe(original.name);
    expect(withNewId.city).toBe(original.city);
    expect(withNewId.country).toBe(original.country);
    expect(withNewId.availability).toBe(original.availability);
    expect(withNewId.pricePerNight).toBe(original.pricePerNight);
    expect(withNewId.priceSegment).toBe(original.priceSegment);
    expect(withNewId.raw).toBe(original.raw);

    // createdAt/updatedAt preserved (same references)
    expect(withNewId.createdAt).toBe(createdAt);
    expect(withNewId.updatedAt).toBe(updatedAt);

    // original id unchanged
    expect(original.id).toBe('old-id');
  });
});
