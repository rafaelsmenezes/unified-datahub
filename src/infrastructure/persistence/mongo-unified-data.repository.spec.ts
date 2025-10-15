import { MongoUnifiedDataRepository } from './mongo-unified-data.repository';
import { UnifiedData } from '../../domain/entities/unified-data.entity';

describe('MongoUnifiedDataRepository', () => {
  const mockModel: any = {
    find: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn(),
    syncIndexes: jest.fn(),
  };

  const repo = new MongoUnifiedDataRepository(mockModel);

  it('onModuleInit calls syncIndexes', async () => {
    await repo.onModuleInit();
    expect(mockModel.syncIndexes).toHaveBeenCalled();
  });

  it('saveAll calls baseRepo.bulkUpsert', async () => {
    const records = [UnifiedData.create({ source: 's', externalId: 'e' })];
    const spy = jest.spyOn(repo['baseRepo'], 'bulkUpsert').mockResolvedValue();
    await repo.saveAll(records);
    expect(spy).toHaveBeenCalled();
  });
});
