import { NotFoundException } from '@nestjs/common';
import { GetDataByIdUseCase } from './get-data-by-id.usecase';
import { UnifiedData } from '../../domain/entities/unified-data.entity';

describe('GetDataByIdUseCase', () => {
  const makeRepository = (item: UnifiedData | null) => ({
    saveAll: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn().mockResolvedValue(item),
    findFiltered: jest.fn(),
    count: jest.fn(),
  });

  it('returns the item when repository returns an entity', async () => {
    const sample = UnifiedData.create({
      source: 'src1',
      externalId: 'ext-123',
      name: 'Test',
      city: 'City',
      country: 'Country',
      availability: true,
      pricePerNight: 100,
      priceSegment: 'mid',
      raw: { a: 1 },
    }).withId('id-1');

    const repo = makeRepository(sample);
    const usecase = new GetDataByIdUseCase(repo as any);

    const result = await usecase.execute('ext-123');

    expect(repo.findOne).toHaveBeenCalledWith({ externalId: 'ext-123' });
    expect(result).toBe(sample);
  });

  it('throws NotFoundException when repository returns null', async () => {
    const repo = makeRepository(null);
    const usecase = new GetDataByIdUseCase(repo as any);

    await expect(usecase.execute('missing-id')).rejects.toThrow(
      NotFoundException,
    );
    expect(repo.findOne).toHaveBeenCalledWith({ externalId: 'missing-id' });
  });
});
