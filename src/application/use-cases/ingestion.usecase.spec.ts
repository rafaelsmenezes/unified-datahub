import { IngestionUseCase } from '../../../dist/application/use-cases/ingestion.usecase';

describe('IngestionUseCase', () => {
  it('calls ingestionService.ingestAll once', async () => {
    const ingestionService = {
      ingestAll: jest.fn().mockResolvedValue(undefined),
    };
    const usecase = new IngestionUseCase(ingestionService as any);

    await usecase.execute();

    expect(ingestionService.ingestAll).toHaveBeenCalledTimes(1);
  });

  it('propagates errors from ingestionService', async () => {
    const err = new Error('boom');
    const ingestionService = { ingestAll: jest.fn().mockRejectedValue(err) };
    const usecase = new IngestionUseCase(ingestionService as any);

    await expect(usecase.execute()).rejects.toBe(err);
    expect(ingestionService.ingestAll).toHaveBeenCalledTimes(1);
  });
});
