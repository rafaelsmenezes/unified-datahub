import { UnifiedData } from './unified-data.entity';

describe('UnifiedData', () => {
  test('create returns UnifiedData with provided fields and empty id', () => {
    const raw = { foo: 'bar' };
    const ud = UnifiedData.create({
      source: 'providerA',
      externalId: 'ext-123',
      name: 'Hotel X',
      city: 'CityY',
      country: 'CountryZ',
      availability: true,
      pricePerNight: 150,
      priceSegment: 'mid',
      raw,
    });

    expect(ud.id).toBe('');
    expect(ud.source).toBe('providerA');
    expect(ud.externalId).toBe('ext-123');
    expect(ud.name).toBe('Hotel X');
    expect(ud.city).toBe('CityY');
    expect(ud.country).toBe('CountryZ');
    expect(ud.availability).toBe(true);
    expect(ud.pricePerNight).toBe(150);
    expect(ud.priceSegment).toBe('mid');
    expect(ud.raw).toBe(raw);
    expect(ud.createdAt).toBeUndefined();
    expect(ud.updatedAt).toBeUndefined();
  });

  test('create throws when pricePerNight is negative', () => {
    expect(() =>
      UnifiedData.create({
        source: 's',
        externalId: 'e',
        pricePerNight: -5,
      }),
    ).toThrow('pricePerNight cannot be negative');
  });

  test('constructor throws when source is empty', () => {
    expect(() => new UnifiedData('id-1', '', 'ext-1')).toThrow(
      'UnifiedData must have a source',
    );
  });

  test('constructor throws when externalId is empty', () => {
    expect(() => new UnifiedData('id-2', 'src-1', '')).toThrow(
      'UnifiedData must have an externalId',
    );
  });

  test('create forwards empty source/externalId to constructor and triggers constructor validation', () => {
    expect(() =>
      UnifiedData.create({
        source: '',
        externalId: 'ext',
      }),
    ).toThrow('UnifiedData must have a source');

    expect(() =>
      UnifiedData.create({
        source: 'src',
        externalId: '',
      }),
    ).toThrow('UnifiedData must have an externalId');
  });

  test('withId returns new instance with new id and preserves other fields including timestamps', () => {
    const createdAt = new Date('2020-01-01T00:00:00.000Z');
    const updatedAt = new Date('2020-01-02T00:00:00.000Z');
    const raw = { a: 1 };

    const original = new UnifiedData(
      'old-id',
      'srcX',
      'extX',
      'NameX',
      'CityX',
      'CountryX',
      false,
      75,
      'low',
      raw,
      createdAt,
      updatedAt,
    );

    const withNewId = original.withId('new-id');

    expect(withNewId.id).toBe('new-id');
    expect(withNewId.source).toBe(original.source);
    expect(withNewId.externalId).toBe(original.externalId);
    expect(withNewId.name).toBe(original.name);
    expect(withNewId.city).toBe(original.city);
    expect(withNewId.country).toBe(original.country);
    expect(withNewId.availability).toBe(original.availability);
    expect(withNewId.pricePerNight).toBe(original.pricePerNight);
    expect(withNewId.priceSegment).toBe(original.priceSegment);
    expect(withNewId.raw).toBe(raw);
    expect(withNewId.createdAt?.getTime()).toBe(createdAt.getTime());
    expect(withNewId.updatedAt?.getTime()).toBe(updatedAt.getTime());
  });
});
