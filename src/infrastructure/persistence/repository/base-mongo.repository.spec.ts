import { BaseMongoRepository } from './base-mongo.repository';

type AnyModel = Record<string, any>;

describe('BaseMongoRepository', () => {
  const makeChainable = (result: any = undefined) => {
    const exec = jest.fn().mockResolvedValue(result);
    const lean = jest.fn().mockReturnValue({ exec });
    const sort = jest.fn().mockReturnValue({ lean });
    const skip = jest.fn().mockReturnValue({ sort });
    const limit = jest.fn().mockReturnValue({ skip });
    return { limit, skip, sort, lean, exec };
  };

  let modelMock: AnyModel;
  let repo: BaseMongoRepository<any>;

  beforeEach(() => {
    modelMock = {
      findById: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
      bulkWrite: jest.fn().mockResolvedValue(undefined),
    };
    repo = new BaseMongoRepository<any>(modelMock as any);
  });

  test('findById calls model.findById and returns result', async () => {
    const expected = { _id: '1', a: 1 };
    const chain = {
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(expected),
    };
    modelMock.findById.mockReturnValue(chain);

    const res = await repo.findById('1');

    expect(modelMock.findById).toHaveBeenCalledWith('1');
    expect(chain.lean).toHaveBeenCalled();
    expect(chain.exec).toHaveBeenCalled();
    expect(res).toBe(expected);
  });

  test('findOne calls model.findOne and returns result', async () => {
    const expected = { _id: '2', b: 2 };
    const chain = {
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(expected),
    };
    const filter = { b: 2 };
    modelMock.findOne.mockReturnValue(chain);

    const res = await repo.findOne(filter);

    expect(modelMock.findOne).toHaveBeenCalledWith(filter);
    expect(chain.lean).toHaveBeenCalled();
    expect(chain.exec).toHaveBeenCalled();
    expect(res).toBe(expected);
  });

  test('findMany uses default options (limit=25, skip=0, sort={createdAt:-1})', async () => {
    const docs = [{ _id: 'a' }, { _id: 'b' }];
    const chain = makeChainable(docs);
    modelMock.find.mockReturnValue(chain);

    const res = await repo.findMany({ active: true });

    expect(modelMock.find).toHaveBeenCalledWith({ active: true });
    expect(chain.limit).toHaveBeenCalledWith(25);
    expect(chain.skip).toHaveBeenCalledWith(0);
    expect(chain.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(chain.lean).toHaveBeenCalled();
    expect(chain.exec).toHaveBeenCalled();
    expect(res).toBe(docs);
  });

  test('findMany applies provided options and caps limit at 1000', async () => {
    const docs: any[] = [];
    const chain = makeChainable(docs);
    modelMock.find.mockReturnValue(chain);

    const res = await repo.findMany(
      { x: 1 },
      { limit: 5000, skip: 10, sort: { x: 1 } },
    );

    expect(modelMock.find).toHaveBeenCalledWith({ x: 1 });
    expect(chain.limit).toHaveBeenCalledWith(1000);
    expect(chain.skip).toHaveBeenCalledWith(10);
    expect(chain.sort).toHaveBeenCalledWith({ x: 1 });
    expect(res).toBe(docs);
  });

  test('count calls model.countDocuments and returns number', async () => {
    const chain = { exec: jest.fn().mockResolvedValue(42) };
    modelMock.countDocuments.mockReturnValue(chain);

    const res = await repo.count({ ok: true });

    expect(modelMock.countDocuments).toHaveBeenCalledWith({ ok: true });
    expect(chain.exec).toHaveBeenCalled();
    expect(res).toBe(42);
  });

  test('bulkUpsert returns early when docs array is empty', async () => {
    await repo.bulkUpsert([], () => ({ _id: 'x' }));

    expect(modelMock.bulkWrite).not.toHaveBeenCalled();
  });

  test('bulkUpsert builds updateOne ops and calls bulkWrite with session undefined', async () => {
    const docs = [
      { _id: '1', a: 1 },
      { _id: '2', a: 2 },
    ];
    const keySelector = (d: any) => ({ _id: d._id });

    modelMock.bulkWrite.mockResolvedValue(undefined);

    await repo.bulkUpsert(docs, keySelector);

    const expectedOps = docs.map((doc) => ({
      updateOne: {
        filter: { _id: doc._id },
        update: { $set: doc },
        upsert: true,
      },
    }));

    expect(modelMock.bulkWrite).toHaveBeenCalledTimes(1);
    expect(modelMock.bulkWrite).toHaveBeenCalledWith(expectedOps, {
      ordered: false,
      session: undefined,
    });
  });

  test('bulkUpsert passes provided session to bulkWrite', async () => {
    const docs = [{ _id: 's1' }];
    const keySelector = (d: any) => ({ _id: d._id });
    const fakeSession = { id: 'session-1' } as any;

    await repo.bulkUpsert(docs, keySelector, fakeSession);

    expect(modelMock.bulkWrite).toHaveBeenCalledWith(
      [
        {
          updateOne: {
            filter: { _id: 's1' },
            update: { $set: docs[0] },
            upsert: true,
          },
        },
      ],
      { ordered: false, session: fakeSession },
    );
  });

  test('bulkUpsert chunks docs according to BULK_CHUNK_SIZE', async () => {
    (BaseMongoRepository as any).BULK_CHUNK_SIZE = 2;

    const docs = [
      { _id: 'c1' },
      { _id: 'c2' },
      { _id: 'c3' },
      { _id: 'c4' },
      { _id: 'c5' },
    ];
    const keySelector = (d: any) => ({ _id: d._id });

    await repo.bulkUpsert(docs, keySelector);

    expect(modelMock.bulkWrite).toHaveBeenCalledTimes(3);

    const firstCallOps = [
      {
        updateOne: {
          filter: { _id: 'c1' },
          update: { $set: docs[0] },
          upsert: true,
        },
      },
      {
        updateOne: {
          filter: { _id: 'c2' },
          update: { $set: docs[1] },
          upsert: true,
        },
      },
    ];
    const secondCallOps = [
      {
        updateOne: {
          filter: { _id: 'c3' },
          update: { $set: docs[2] },
          upsert: true,
        },
      },
      {
        updateOne: {
          filter: { _id: 'c4' },
          update: { $set: docs[3] },
          upsert: true,
        },
      },
    ];
    const thirdCallOps = [
      {
        updateOne: {
          filter: { _id: 'c5' },
          update: { $set: docs[4] },
          upsert: true,
        },
      },
    ];

    expect(modelMock.bulkWrite).toHaveBeenNthCalledWith(1, firstCallOps, {
      ordered: false,
      session: undefined,
    });
    expect(modelMock.bulkWrite).toHaveBeenNthCalledWith(2, secondCallOps, {
      ordered: false,
      session: undefined,
    });
    expect(modelMock.bulkWrite).toHaveBeenNthCalledWith(3, thirdCallOps, {
      ordered: false,
      session: undefined,
    });
  });
});
