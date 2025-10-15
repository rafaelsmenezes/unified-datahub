import { MongoUnifiedDataMapper } from './mongo-unified-data.mapper';
import { UnifiedData } from '../../domain/entities/unified-data.entity';

describe('MongoUnifiedDataMapper', () => {
  const doc = {
    _id: '1',
    source: 'src',
    externalId: 'ext-1',
    name: 'Hotel X',
    city: 'City',
    country: 'Country',
    availability: true,
    pricePerNight: 100,
    priceSegment: 'mid',
    raw: { foo: 'bar' },
  };

  it('toDomain should map correctly', () => {
    const entity = MongoUnifiedDataMapper.toDomain(doc);
    expect(entity).toBeInstanceOf(UnifiedData);
    expect(entity.id).toBe('1');
    expect(entity.source).toBe('src');
  });

  it('toDomain should throw on missing _id, source or externalId', () => {
    expect(() => MongoUnifiedDataMapper.toDomain({} as any)).toThrow();
    expect(() =>
      MongoUnifiedDataMapper.toDomain({ _id: '1' } as any),
    ).toThrow();
  });

  it('toPersistence should map correctly', () => {
    const entity = UnifiedData.create({ source: 'src', externalId: 'ext' });
    const persistence = MongoUnifiedDataMapper.toPersistence(entity);
    expect(persistence.source).toBe('src');
    expect(persistence.externalId).toBe('ext');
  });

  it('toPersistenceMany should map multiple entities', () => {
    const entities = [
      UnifiedData.create({ source: 's1', externalId: 'e1' }),
      UnifiedData.create({ source: 's2', externalId: 'e2' }),
    ];
    const pers = MongoUnifiedDataMapper.toPersistenceMany(entities);
    expect(pers.length).toBe(2);
  });
});
