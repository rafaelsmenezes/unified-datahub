import { BatchSaverService } from './batch-saver.service';
import { IUnifiedDataRepository } from '../../../domain/repositories/unified-data.repository.interface';

describe('BatchSaverService', () => {
  test('saves batches and respects MAX_CONCURRENT_BATCHES', async () => {
    let active = 0;
    let maxActive = 0;
    const saveAll = jest.fn().mockImplementation(() => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      return new Promise<void>((resolve) =>
        setTimeout(() => {
          active -= 1;
          resolve();
        }, 10),
      );
    });

    const repository: IUnifiedDataRepository = { saveAll } as any;
    const svc = new BatchSaverService(repository);

    const batches = (async function* () {
      await Promise.resolve();
      yield [{ id: 1 } as any];
      yield [{ id: 2 } as any];
      yield [{ id: 3 } as any];
      yield [{ id: 4 } as any];
      yield [{ id: 5 } as any];
    })();

    await svc.saveBatches(batches);

    expect(saveAll).toHaveBeenCalledTimes(5);
    expect(maxActive).toBeLessThanOrEqual(3);
  });

  test('handles repository.saveAll errors and continues', async () => {
    const saveAll = jest
      .fn()
      .mockImplementationOnce(() => Promise.resolve())
      .mockImplementationOnce(() => Promise.reject(new Error('fail')))
      .mockImplementationOnce(() => Promise.resolve());

    const repository: IUnifiedDataRepository = { saveAll } as any;
    const svc = new BatchSaverService(repository);

    const batches = (async function* () {
      await Promise.resolve();
      yield [{ id: 1 } as any];
      yield [{ id: 2 } as any];
      yield [{ id: 3 } as any];
    })();

    await svc.saveBatches(batches);
    expect(saveAll).toHaveBeenCalledTimes(3);
  });

  test('ignores empty batches', async () => {
    const saveAll = jest.fn().mockResolvedValue(undefined);
    const repository: IUnifiedDataRepository = { saveAll } as any;
    const svc = new BatchSaverService(repository);

    const batches = (async function* () {
      await Promise.resolve();
      yield [];
      yield [{ id: 1 } as any];
    })();

    await svc.saveBatches(batches);
    expect(saveAll).toHaveBeenCalledTimes(1);
  });

  test('handles a large number of small batches while respecting concurrency', async () => {
    const calls: number[] = [];
    const saveAll = jest.fn().mockImplementation(async (_batch: any[]) => {
      calls.push(1);
      await new Promise((r) => setTimeout(r, 2));
    });

    const repository: IUnifiedDataRepository = { saveAll } as any;
    const svc = new BatchSaverService(repository);

    const batches = (async function* () {
      for (let i = 0; i < 50; i++) {
        yield [{ id: i } as any];
      }
    })();

    await svc.saveBatches(batches);
    expect(saveAll).toHaveBeenCalledTimes(50);
  }, 20000);

  test('very large stream stress test', async () => {
    const calls: number[] = [];
    const saveAll = jest.fn().mockImplementation(async () => {
      calls.push(1);
      await new Promise((r) => setTimeout(r, 1));
    });

    const repository: IUnifiedDataRepository = { saveAll } as any;
    const svc = new BatchSaverService(repository);

    const batches = (async function* () {
      await Promise.resolve();
      for (let i = 0; i < 500; i++) {
        yield [{ id: i } as any];
      }
    })();

    await svc.saveBatches(batches);
    expect(saveAll).toHaveBeenCalledTimes(500);
  }, 60000);
});
