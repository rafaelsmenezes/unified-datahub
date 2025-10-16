import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AdminController } from './admin.controller';
import { IngestionUseCase } from '../../application/use-cases/ingestion.usecase';

describe('AdminController (integration)', () => {
  let app: INestApplication;
  const mockIngestionUseCase = {
    execute: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: IngestionUseCase,
          useValue: mockIngestionUseCase,
        },
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
    jest.clearAllMocks();
  });

  it('should return 202 Accepted and start ingestion', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/admin/ingest')
      .expect(HttpStatus.ACCEPTED);

    expect(response.body).toEqual({ status: 'ingestion_started' });

    expect(mockIngestionUseCase.execute).toHaveBeenCalledTimes(1);
  });

  it('should not throw if ingestion fails asynchronously', async () => {
    mockIngestionUseCase.execute.mockRejectedValueOnce(
      new Error('Simulated ingestion failure'),
    );

    const response = await request(app.getHttpServer())
      .post('/api/admin/ingest')
      .expect(HttpStatus.ACCEPTED);

    expect(response.body).toEqual({ status: 'ingestion_started' });
    expect(mockIngestionUseCase.execute).toHaveBeenCalledTimes(1);
  });
});
