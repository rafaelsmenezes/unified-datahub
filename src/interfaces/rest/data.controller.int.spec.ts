import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataController } from './data.controller';
import { QueryDataUseCase } from '../../application/use-cases/query-data.usecase';
import { GetDataByIdUseCase } from 'src/application/use-cases/get-data-by-id.usecase';
import { IUnifiedDataRepositoryToken } from 'src/domain/repositories/unified-data.repository.interface';

describe('DataController (integration)', () => {
  let app: INestApplication;
  let capturedFilters: any = null;
  let capturedOptions: any = null;

  const mockRepo = {
    findFiltered: jest.fn().mockImplementation((filters, options) => {
      capturedFilters = filters;
      capturedOptions = options;
      return Promise.resolve([]);
    }),
    count: jest.fn().mockResolvedValue(0),
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

  it('applies priceMin filter when provided', async () => {
    capturedFilters = null;
    capturedOptions = null;

    await request(app.getHttpServer())
      .get('/api/data')
      .query({ priceMin: '150', limit: '5' })
      .expect(200);

    expect(capturedFilters).toBeDefined();
    expect(capturedFilters.pricePerNight).toEqual({ $gte: 150 });
    expect(capturedOptions).toBeDefined();
    expect(capturedOptions.limit).toBe(5);
  });

  it('applies availability filter when provided', async () => {
    capturedFilters = null;
    capturedOptions = null;

    await request(app.getHttpServer())
      .get('/api/data')
      .query({ availability: 'true', limit: '5' })
      .expect(200);

    expect(capturedFilters).toBeDefined();
    expect(capturedFilters.availability).toBe(true);
    expect(capturedOptions.limit).toBe(5);
  });

  it('applies city and source filters', async () => {
    capturedFilters = null;
    capturedOptions = null;

    await request(app.getHttpServer())
      .get('/api/data')
      .query({ city: 'Lisbon', source: 'source1', limit: '3' })
      .expect(200);

    expect(capturedFilters.city).toBeDefined();
    expect(capturedFilters.source).toBe('source1');
    expect(capturedOptions.limit).toBe(3);
  });

  it('applies priceMax filter only', async () => {
    capturedFilters = null;
    await request(app.getHttpServer())
      .get('/api/data')
      .query({ priceMax: '400' })
      .expect(200);

    expect(capturedFilters.pricePerNight).toEqual({ $lte: 400 });
  });

  it('applies both priceMin and priceMax', async () => {
    capturedFilters = null;
    await request(app.getHttpServer())
      .get('/api/data')
      .query({ priceMin: '100', priceMax: '300' })
      .expect(200);

    expect(capturedFilters.pricePerNight).toEqual({ $gte: 100, $lte: 300 });
  });

  it('applies priceSegment filter', async () => {
    capturedFilters = null;
    await request(app.getHttpServer())
      .get('/api/data')
      .query({ priceSegment: 'budget' })
      .expect(200);

    expect(capturedFilters.priceSegment).toBe('budget');
  });

  it('builds full-text $or for q param', async () => {
    capturedFilters = null;
    await request(app.getHttpServer())
      .get('/api/data')
      .query({ q: 'beach' })
      .expect(200);

    expect(capturedFilters.$or).toBeInstanceOf(Array);
    expect(Array.isArray(capturedFilters.$or)).toBe(true);
    expect(capturedFilters.$or.length).toBeGreaterThan(0);
    const hasRegexClause = capturedFilters.$or.some((clause: any) => {
      const val = Object.values(clause)[0] as any;
      return typeof val === 'object' && val !== null && '$regex' in val;
    });
    expect(hasRegexClause).toBe(true);
  });

  it('applies sort and pagination options', async () => {
    capturedFilters = null;
    capturedOptions = null;
    await request(app.getHttpServer())
      .get('/api/data')
      .query({
        sortBy: 'pricePerNight',
        sortDir: 'asc',
        limit: '10',
        skip: '20',
      })
      .expect(200);

    expect(capturedOptions).toBeDefined();
    expect(capturedOptions.sort).toEqual({ pricePerNight: 1 });
    expect(capturedOptions.limit).toBe(10);
    expect(capturedOptions.skip).toBe(20);
  });

  it('throw 400 if sortDir is invalid', async () => {
    await request(app.getHttpServer())
      .get('/api/data')
      .query({
        sortBy: 'pricePerNight',
        sortDir: 'invalidDir',
      })
      .expect(400);
  });

  it('uses defaults when no query params provided', async () => {
    capturedFilters = null;
    capturedOptions = null;
    await request(app.getHttpServer()).get('/api/data').expect(200);

    expect(capturedFilters).toEqual({});
    expect(capturedOptions).toBeDefined();
    expect(capturedOptions.limit).toBe(100);
    expect(capturedOptions.skip).toBe(0);
    expect(capturedOptions.sort).toEqual({ createdAt: -1 });
  });
});
