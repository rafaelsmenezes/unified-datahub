import { BaseMongoRepository } from './base-mongo.repository';

describe('BaseMongoRepository', () => {
  const mockModel: any = {
    findById: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    find: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn(),
    countDocuments: jest.fn().mockReturnValue({ exec: jest.fn() }),
    bulkWrite: jest.fn(),
  };

  const repo = new BaseMongoRepository(mockModel);

  it('findById calls model', async () => {
    mockModel.exec.mockResolvedValue('doc');
    const res = await repo.findById('1');
    expect(res).toBe('doc');
    expect(mockModel.findById).toHaveBeenCalledWith('1');
  });

  it('bulkUpsert calls bulkWrite', async () => {
    const docs = [{ a: 1 }];
    await repo.bulkUpsert(docs, (d) => ({ a: d.a }));
    expect(mockModel.bulkWrite).toHaveBeenCalled();
  });
});
