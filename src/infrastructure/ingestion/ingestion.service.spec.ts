import { Test } from '@nestjs/testing';
import { IngestionService } from './ingestion.service';
import {
  IStreamGeneratorServiceToken,
  IStreamGeneratorService,
} from '../../domain/ingestion/stream-generator.interface';
import {
  IBatchSaverService,
  IBatchSaverServiceToken,
} from '../../domain/ingestion/batch-saver.interface';

describe('IngestionService', () => {
  test('ingestAll calls streamGenerator.fetch and batchSaver.saveBatches', async () => {
    const fetch = jest.fn().mockReturnValue(
      (async function* () {
        await Promise.resolve();
        yield [{ id: 1 } as any];
      })(),
    );

    const saveBatches = jest.fn().mockResolvedValue(undefined);

    const moduleRef = await Test.createTestingModule({
      providers: [
        IngestionService,
        {
          provide: IStreamGeneratorServiceToken,
          useValue: { fetch } as IStreamGeneratorService,
        },
        {
          provide: IBatchSaverServiceToken,
          useValue: { saveBatches } as IBatchSaverService,
        },
      ],
    }).compile();

    const ingestion = moduleRef.get(IngestionService);

    const mapper = { map: (r: unknown) => r };
    ingestion.registerSource({
      name: 't',
      url: 'u',
      mapper,
    });
    await ingestion.ingestAll();

    expect(fetch).toHaveBeenCalledWith(
      'u',
      expect.any(Object),
      expect.any(Number),
    );
    expect(saveBatches).toHaveBeenCalled();
  });

  test('ingestAll (unit) continues on streamGenerator.fetch error and logs', async () => {
    const fetch = jest.fn().mockImplementation(() => {
      throw new Error('boom');
    });
    const saveBatches = jest.fn().mockResolvedValue(undefined);

    const moduleRef = await Test.createTestingModule({
      providers: [
        IngestionService,
        {
          provide: IStreamGeneratorServiceToken,
          useValue: { fetch } as IStreamGeneratorService,
        },
        {
          provide: IBatchSaverServiceToken,
          useValue: { saveBatches } as IBatchSaverService,
        },
      ],
    }).compile();

    const ingestion = moduleRef.get(IngestionService);
    const mapper2 = { map: (r: unknown) => r };
    ingestion.registerSource({
      name: 'fail',
      url: 'u',
      mapper: mapper2,
    });

    await ingestion.ingestAll();

    expect(fetch).toHaveBeenCalled();
    expect(saveBatches).not.toHaveBeenCalled();
  });
});
