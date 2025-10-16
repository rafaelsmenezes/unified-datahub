import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ApiController } from './api.controller';
import { QueryDataUseCase } from '../../application/use-cases/query-data.usecase';
import { GetDataByIdUseCase } from 'src/application/use-cases/get-data-by-id.usecase';
import { IUnifiedDataRepositoryToken } from 'src/domain/repositories/unified-data.repository.interface';

describe('ApiController (integration)', () => {
  let app: INestApplication;
  let capturedFilters: any = null;

  const mockRepo = {
    findFiltered: jest.fn().mockImplementation((filters) => {
      capturedFilters = filters;
      return Promise.resolve([]);
    }),
    count: jest.fn().mockResolvedValue(0),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ApiController],
      providers: [
        QueryDataUseCase,
        GetDataByIdUseCase,
        { provide: IUnifiedDataRepositoryToken, useValue: mockRepo },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('applies priceMin filter when provided', async () => {
    await request(app.getHttpServer())
      .get('/api/data')
      .query({ priceMin: '150', limit: '5' })
      .expect(200);

    expect(capturedFilters).toBeDefined();
    expect(capturedFilters.pricePerNight).toEqual({ $gte: 150 });
  });

  it('applies availability filter when provided', async () => {
    await request(app.getHttpServer())
      .get('/api/data')
      .query({ availability: 'true', limit: '5' })
      .expect(200);

    expect(capturedFilters).toBeDefined();
    expect(capturedFilters.availability).toBe(true);
  });
});
