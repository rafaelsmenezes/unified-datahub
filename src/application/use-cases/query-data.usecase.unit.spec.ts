import { Test, TestingModule } from '@nestjs/testing';
import { QueryDataUseCase } from './query-data.usecase';
import { IUnifiedDataRepositoryToken } from '../../domain/repositories/unified-data.repository.interface';
import { QueryDataDto } from '../../interfaces/rest/dto/query-data.dto';

describe('QueryDataUseCase (unit)', () => {
  let usecase: QueryDataUseCase;
  const mockRepo = {
    findFiltered: jest.fn().mockResolvedValue([{ id: '1' }]),
    count: jest.fn().mockResolvedValue(1),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueryDataUseCase,
        { provide: IUnifiedDataRepositoryToken, useValue: mockRepo },
      ],
    }).compile();

    usecase = module.get(QueryDataUseCase);
  });

  afterAll(async () => {
    jest.resetAllMocks();
  });

  it('calls repository with proper filters and options and returns meta', async () => {
    const dto: QueryDataDto = {
      priceMin: 100,
      priceMax: 200,
      limit: 5,
      skip: 2,
      sortBy: 'pricePerNight',
      sortDir: 'asc',
    } as any;

    const res = await usecase.execute(dto);

    expect(mockRepo.findFiltered).toHaveBeenCalledWith(
      { pricePerNight: { $gte: 100, $lte: 200 } },
      { limit: 5, skip: 2, sort: { pricePerNight: 1 } },
    );
    expect(mockRepo.count).toHaveBeenCalledWith({
      pricePerNight: { $gte: 100, $lte: 200 },
    });
    expect(res.meta).toBeDefined();
    expect(res.meta.total).toBe(1);
    expect(res.items).toHaveLength(1);
  });
});
