import { QueryDataUseCase } from './query-data.usecase';

describe('QueryDataUseCase', () => {
  const makeRepo = (items: any[], total = items.length) => ({
    findFiltered: jest.fn().mockResolvedValue(items),
    count: jest.fn().mockResolvedValue(total),
    saveAll: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
  });

  it('returns items and meta with defaults when no query provided', async () => {
    const items = [{ id: '1' }, { id: '2' }];
    const repo = makeRepo(items, 10);

    const query = {} as any;

    const usecase = new QueryDataUseCase(repo as any);

    const result = await usecase.execute(query);

    expect(repo.findFiltered).toHaveBeenCalledWith(
      {},
      { limit: 25, skip: 0, sort: { createdAt: -1 } },
    );
    expect(repo.count).toHaveBeenCalledWith({});
    expect(result.items).toBe(items);
    expect(result.meta).toEqual({ total: 10, limit: 25, skip: 0 });
  });

  it('respects provided limit/skip/sort and sort direction', async () => {
    const items = [];
    const repo = makeRepo(items, 0);

    const query = {
      limit: 5,
      skip: 2,
      sortBy: 'pricePerNight',
      sortDir: 'asc',
    } as any;

    const usecase = new QueryDataUseCase(repo as any);

    const result = await usecase.execute(query);

    expect(repo.findFiltered).toHaveBeenCalledWith(
      {},
      { limit: 5, skip: 2, sort: { pricePerNight: 1 } },
    );
    expect(result.meta).toEqual({ total: 0, limit: 5, skip: 2 });
  });
});
