import { UnifiedData } from './unified-data.entity';

describe('UnifiedData', () => {
  it('should create a valid instance', () => {
    const data = UnifiedData.create({
      source: 'source1',
      externalId: '123',
      name: 'Hotel A',
      pricePerNight: 100,
    });

    expect(data.source).toBe('source1');
    expect(data.externalId).toBe('123');
    expect(data.name).toBe('Hotel A');
    expect(data.pricePerNight).toBe(100);
    expect(data.id).toBe('');
  });

  it('should throw if source or externalId is missing', () => {
    expect(() => new UnifiedData('', '', '')).toThrow();
  });

  it('withId should return a new instance with updated id', () => {
    const data = UnifiedData.create({ source: 's', externalId: 'e' });
    const newData = data.withId('new-id');
    expect(newData.id).toBe('new-id');
    expect(newData.source).toBe(data.source);
    expect(newData.externalId).toBe(data.externalId);
  });

  it('should throw if pricePerNight is negative', () => {
    expect(() =>
      UnifiedData.create({ source: 's', externalId: 'e', pricePerNight: -10 }),
    ).toThrow('pricePerNight cannot be negative');
  });
});
