import { Readable } from 'stream';
import { Logger } from '@nestjs/common';
import {
  fetchHttpStream,
  mapStream,
  batchStream,
} from './stream-generator.functions';

describe('stream-generator.functions', () => {
  const logger = { error: jest.fn() } as unknown as Logger;

  afterEach(() => {
    jest.clearAllMocks();
  });

  async function collect<T>(gen: AsyncIterable<T>) {
    const out: T[] = [];
    for await (const v of gen) out.push(v);
    return out;
  }

  test('fetchHttpStream yields parsed JSON array values', async () => {
    const json = '[{"id":1},{"id":2}]';
    const httpClient = {
      getStream: jest.fn().mockResolvedValue(Readable.from([json])),
    } as any;

    const gen = fetchHttpStream('http://x', httpClient, logger);
    const result = await collect(gen);
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    expect(httpClient.getStream).toHaveBeenCalledWith('http://x');
  });

  test('fetchHttpStream logs and rethrows on stream error', async () => {
    const badJson = '[{ this is invalid json ]';
    const httpClient = {
      getStream: jest.fn().mockResolvedValue(Readable.from([badJson])),
    } as any;

    await expect(async () => {
      const gen = fetchHttpStream('bad-url', httpClient, logger);
      for await (const value of gen) {
        await Promise.resolve(value);
      }
    }).rejects.toBeDefined();

    expect((logger.error as jest.Mock).mock.calls.length).toBeGreaterThan(0);
  });

  test('fetchHttpStream handles chunked JSON across multiple chunks', async () => {
    const chunks = [
      Buffer.from('['),
      Buffer.from('{"id":1}'),
      Buffer.from(','),
      Buffer.from('{"id":2}'),
      Buffer.from(']'),
    ];

    const httpClient = {
      getStream: jest.fn().mockResolvedValue(Readable.from(chunks)),
    } as any;

    const gen = fetchHttpStream('http://chunked', httpClient, logger);
    const result = await collect(gen);
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    expect(httpClient.getStream).toHaveBeenCalledWith('http://chunked');
  });

  test('fetchHttpStream handles chunks split inside numbers/objects', async () => {
    const chunks = [
      Buffer.from('['),
      Buffer.from('{"id":12'),
      Buffer.from('345}'),
      Buffer.from(',{"id":6'),
      Buffer.from('7890}'),
      Buffer.from(']'),
    ];

    const httpClient = {
      getStream: jest.fn().mockResolvedValue(Readable.from(chunks)),
    } as any;

    const gen = fetchHttpStream('http://chunked-numbers', httpClient, logger);
    const result = await collect(gen);
    expect(result).toEqual([{ id: 12345 }, { id: 67890 }]);
  });

  test('fetchHttpStream handles chunks split inside string values', async () => {
    const chunks = [
      Buffer.from('['),
      Buffer.from('{"name":"Hel'),
      Buffer.from('lo"}'),
      Buffer.from(',{"name":"Wor'),
      Buffer.from('ld"}'),
      Buffer.from(']'),
    ];

    const httpClient = {
      getStream: jest.fn().mockResolvedValue(Readable.from(chunks)),
    } as any;

    const gen = fetchHttpStream('http://chunked-strings', httpClient, logger);
    const result = await collect(gen);
    expect(result).toEqual([{ name: 'Hello' }, { name: 'World' }]);
  });

  test('mapStream maps records and logs mapper errors', async () => {
    const input = (async function* () {
      await Promise.resolve();
      yield 1;
      yield 2;
      yield 3;
    })();

    const mapper = { map: (v: unknown) => `x${String(v)}` };
    const mapped = await collect(mapStream(input, mapper, logger));
    expect(mapped).toEqual(['x1', 'x2', 'x3']);

    const input2 = (async function* () {
      await Promise.resolve();
      yield 1;
      yield 2;
      yield 3;
    })();
    const badMapper = {
      map: (v: number) => {
        if (v === 2) throw new Error('bad');
        return v;
      },
    };
    const mapped2 = await collect(mapStream(input2, badMapper as any, logger));
    expect(mapped2).toEqual([1, 3]);
    expect((logger.error as jest.Mock).mock.calls.length).toBeGreaterThan(0);
  });

  test('batchStream yields batches of given size and final remainder', async () => {
    const input = (async function* () {
      await Promise.resolve();
      for (let i = 1; i <= 5; i++) yield i;
    })();

    const batches = await collect(batchStream(input, 2));
    expect(batches).toEqual([[1, 2], [3, 4], [5]]);
  });
});
