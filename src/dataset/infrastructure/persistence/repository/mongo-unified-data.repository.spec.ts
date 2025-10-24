import { Model } from 'mongoose';
import { MongoUnifiedDataRepository } from './mongo-unified-data.repository';
import { MongoUnifiedData } from '../models/mongo-unified-data.schema';
import { MongoUnifiedDataMapper } from '../models/mongo-unified-data.mapper';
import { UnifiedData } from '../../../../ingestion/domain/entities/unified-data.entity';

describe('MongoUnifiedDataRepository', () => {
  let repo: MongoUnifiedDataRepository;
  let modelMock: any;
  let baseRepoFindByIdSpy: jest.SpyInstance;
  let baseRepoFindOneSpy: jest.SpyInstance;
  let baseRepoCountSpy: jest.SpyInstance;
  let baseRepoBulkUpsertSpy: jest.SpyInstance;

  beforeEach(() => {
    modelMock = {
      find: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    } as any;

    repo = new MongoUnifiedDataRepository(modelMock as Model<MongoUnifiedData>);

    baseRepoFindByIdSpy = jest.spyOn(repo['baseRepo'], 'findById');
    baseRepoFindOneSpy = jest.spyOn(repo['baseRepo'], 'findOne');
    baseRepoCountSpy = jest.spyOn(repo['baseRepo'], 'count');
    baseRepoBulkUpsertSpy = jest
      .spyOn(repo['baseRepo'], 'bulkUpsert')
      .mockResolvedValue(undefined as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('saveAll should call bulkUpsert with mapped docs and do nothing for empty input', async () => {
    await repo.saveAll([]);
    expect(baseRepoBulkUpsertSpy).not.toHaveBeenCalled();

    const entity = UnifiedData.create({
      source: 's1',
      externalId: 'e1',
      name: 'n',
    }).withId('id1');
    const spy = jest.spyOn(MongoUnifiedDataMapper, 'toPersistenceMany');
    spy.mockImplementation((arr) =>
      arr.map((e: any) => ({
        _id: e.id,
        source: e.source,
        externalId: e.externalId,
      })),
    );

    await repo.saveAll([entity]);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(baseRepoBulkUpsertSpy).toHaveBeenCalledTimes(1);
    const [docsArg] = baseRepoBulkUpsertSpy.mock.calls[0];
    expect(docsArg).toEqual([{ _id: 'id1', source: 's1', externalId: 'e1' }]);
  });

  it('findById should return mapped domain entity or null', async () => {
    const mongoDoc = {
      _id: 'id1',
      source: 's',
      externalId: 'e',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
    baseRepoFindByIdSpy.mockResolvedValue(mongoDoc);

    const result = await repo.findById('id1');
    expect(result).toBeInstanceOf(UnifiedData);
    expect(result?.id).toBe('id1');

    baseRepoFindByIdSpy.mockResolvedValue(null);
    const resultNull = await repo.findById('nope');
    expect(resultNull).toBeNull();
  });

  it('findOne should return mapped domain entity or null', async () => {
    const mongoDoc = {
      _id: 'id2',
      source: 's2',
      externalId: 'e2',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
    baseRepoFindOneSpy.mockResolvedValue(mongoDoc);

    const result = await repo.findOne({ source: 's2' });
    expect(result).toBeInstanceOf(UnifiedData);
    expect(result?.id).toBe('id2');

    baseRepoFindOneSpy.mockResolvedValue(null);
    const resultNull = await repo.findOne({ source: 'x' });
    expect(resultNull).toBeNull();
  });

  it('findFiltered should use model.find and map results', async () => {
    const docs = [
      {
        _id: 'a',
        source: 's',
        externalId: 'e',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    (modelMock.find as jest.Mock).mockReturnThis();
    (modelMock.limit as jest.Mock).mockReturnThis();
    (modelMock.skip as jest.Mock).mockReturnThis();
    (modelMock.sort as jest.Mock).mockReturnThis();
    (modelMock.lean as jest.Mock).mockResolvedValue(docs);

    const results = await repo.findFiltered(
      { source: 's' },
      { limit: 10, skip: 0 },
    );
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);
    expect(results[0]).toBeInstanceOf(UnifiedData);
    expect(results[0].id).toBe('a');
  });

  it('count should delegate to baseRepo.count', async () => {
    baseRepoCountSpy.mockResolvedValue(42 as any);
    const n = await repo.count({ source: 's' });
    expect(n).toBe(42);
  });

  it('saveAll should propagate errors from baseRepo.bulkUpsert', async () => {
    baseRepoBulkUpsertSpy.mockRejectedValue(new Error('db fail'));
    const entity = UnifiedData.create({
      source: 's1',
      externalId: 'e1',
    }).withId('id1');
    await expect(repo.saveAll([entity])).rejects.toThrow('db fail');
  });

  it('findFiltered should throw when model.find errors', async () => {
    (modelMock.find as jest.Mock).mockImplementation(() => {
      throw new Error('find fail');
    });
    await expect(repo.findFiltered({}, {} as any)).rejects.toThrow('find fail');
  });
});
