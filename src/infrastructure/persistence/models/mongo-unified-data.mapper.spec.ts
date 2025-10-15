import { MongoUnifiedDataMapper } from './mongo-unified-data.mapper';
import { UnifiedData } from '../../../domain/entities/unified-data.entity';

describe('MongoUnifiedDataMapper', () => {
  describe('toDomain', () => {
    it('maps a minimal mongo document to UnifiedData', () => {
      const doc: any = {
        _id: 'abc',
        source: 's1',
        externalId: 'ext1',
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2020-01-02'),
      };

      const domain = MongoUnifiedDataMapper.toDomain(doc);

      expect(domain).toBeInstanceOf(UnifiedData);
      expect(domain.id).toBe('abc');
      expect(domain.source).toBe('s1');
      expect(domain.externalId).toBe('ext1');
      expect(domain.createdAt?.toISOString()).toBe(
        new Date('2020-01-01').toISOString(),
      );
    });

    it('throws when required fields are missing', () => {
      expect(() => MongoUnifiedDataMapper.toDomain(null as any)).toThrow(
        /Cannot map empty/,
      );
      expect(() => MongoUnifiedDataMapper.toDomain({} as any)).toThrow(
        /Document must have _id field/,
      );
      expect(() =>
        MongoUnifiedDataMapper.toDomain({ _id: '1' } as any),
      ).toThrow(/Document must have source field/);
      expect(() =>
        MongoUnifiedDataMapper.toDomain({ _id: '1', source: 's' } as any),
      ).toThrow(/Document must have externalId field/);
    });
  });

  describe('toDomainMany', () => {
    it('maps many documents', () => {
      const docs = [
        {
          _id: 'a',
          source: 's',
          externalId: 'e',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: 'b',
          source: 's2',
          externalId: 'e2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const arr = MongoUnifiedDataMapper.toDomainMany(docs as any);
      expect(arr.length).toBe(2);
      expect(arr[0]).toBeInstanceOf(UnifiedData);
      expect(arr[0].id).toBe('a');
    });
  });

  describe('toPersistence', () => {
    it('maps entity to persistence object and includes _id when id present', () => {
      const entity = new UnifiedData(
        'id1',
        's1',
        'ext',
        'name',
        'city',
        'country',
        true,
        100,
        'mid',
        { x: 1 },
        new Date(),
        new Date(),
      );
      const out = MongoUnifiedDataMapper.toPersistence(entity);
      expect(out.source).toBe('s1');
      expect(out.externalId).toBe('ext');
      expect(out._id).toBe('id1');
      expect(out.name).toBe('name');
    });

    it('omits _id for empty id', () => {
      const entity = UnifiedData.create({ source: 's', externalId: 'e' });
      const out = MongoUnifiedDataMapper.toPersistence(entity);
      expect(out._id).toBeUndefined();
    });

    it('throws when entity is falsy', () => {
      expect(() => MongoUnifiedDataMapper.toPersistence(null as any)).toThrow(
        /Cannot map empty entity/,
      );
    });
  });

  describe('toPersistenceMany', () => {
    it('maps many entities', () => {
      const e1 = UnifiedData.create({ source: 's', externalId: 'e' }).withId(
        'i1',
      );
      const e2 = UnifiedData.create({
        source: 's2',
        externalId: 'e2',
      }).withId('i2');
      const out = MongoUnifiedDataMapper.toPersistenceMany([e1, e2]);
      expect(Array.isArray(out)).toBe(true);
      expect(out.length).toBe(2);
      expect(out[0]._id).toBe('i1');
    });
  });
});
