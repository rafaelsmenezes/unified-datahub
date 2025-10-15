import { Readable } from 'stream';
import { StreamGeneratorService } from './stream-generator.service';
import { IHttpClientService } from '../../../domain/http/http-client.interface';

describe('StreamGeneratorService', () => {
  test('fetch produces batches using pipeline', async () => {
    const json = '[{"a":1},{"a":2},{"a":3}]';
    const httpClient: IHttpClientService = {
      getStream: jest.fn().mockResolvedValue(Readable.from([json])),
      get: jest.fn(),
    } as any;

    const svc = new StreamGeneratorService(httpClient as any);

    const out: unknown[] = [];
    for await (const batch of svc.fetch('u', { map: (r: unknown) => r }, 2)) {
      out.push(batch);
    }

    expect(out).toEqual([[{ a: 1 }, { a: 2 }], [{ a: 3 }]]);
    expect(
      (httpClient.getStream as jest.Mock).mock.calls.length,
    ).toBeGreaterThan(0);
  });
});
