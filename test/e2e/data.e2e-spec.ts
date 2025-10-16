import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataController } from '../../src/interfaces/rest/data.controller';
import { QueryDataUseCase } from '../../src/application/use-cases/query-data.usecase';
import { GetDataByIdUseCase } from '../../src/application/use-cases/get-data-by-id.usecase';
import { IUnifiedDataRepositoryToken } from '../../src/domain/repositories/unified-data.repository.interface';

describe('DataController (e2e)', () => {
  let app: INestApplication;
  let capturedFilters: any = null;
  let capturedOptions: any = null;

  const TOTAL = 30;

  const mockRepo = {
    findFiltered: jest.fn().mockImplementation((filters, options) => {
      capturedFilters = filters;
      capturedOptions = options;
      const skip = options?.skip ?? 0;
      const limit = options?.limit ?? 100;
      const items = [] as any[];
      for (let i = skip; i < Math.min(skip + limit, TOTAL); i++) {
        items.push({
          id: String(i),
          index: i,
          city: i % 2 === 0 ? 'Lisbon' : 'Porto',
        });
      }
      return Promise.resolve(items);
    }),
    count: jest.fn().mockResolvedValue(TOTAL),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [DataController],
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

  beforeEach(() => {
    capturedFilters = null;
    capturedOptions = null;
    jest.clearAllMocks();
  });

  it('returns defaults when no query provided', async () => {
    const res = await request(app.getHttpServer()).get('/api/data').expect(200);

    expect(capturedFilters).toEqual({});
    expect(capturedOptions).toBeDefined();
    expect(capturedOptions.limit).toBe(100);
    expect(capturedOptions.skip).toBe(0);
    expect(res.body.meta).toEqual({ total: TOTAL, limit: 100, skip: 0 });
  });

  it('respects explicit limit and skip', async () => {
    await request(app.getHttpServer())
      .get('/api/data')
      .query({ limit: '5', skip: '10' })
      .expect(200);

    expect(capturedOptions.limit).toBe(5);
    expect(capturedOptions.skip).toBe(10);
  });

  it('maps page & pageSize to limit/skip (page 1)', async () => {
    await request(app.getHttpServer())
      .get('/api/data')
      .query({ page: '1', pageSize: '3' })
      .expect(200);

    expect(capturedOptions.limit).toBe(3);
    expect(capturedOptions.skip).toBe(3);
  });

  it('pageSize alone maps to limit', async () => {
    await request(app.getHttpServer())
      .get('/api/data')
      .query({ pageSize: '7' })
      .expect(200);

    expect(capturedOptions.limit).toBe(7);
  });

  it('pagination works with filters (city)', async () => {
    await request(app.getHttpServer())
      .get('/api/data')
      .query({ city: 'Lisbon', limit: '4', skip: '2' })
      .expect(200);

    expect(capturedFilters.city).toBe('Lisbon');
    expect(capturedOptions.limit).toBe(4);
    expect(capturedOptions.skip).toBe(2);
  });
});
