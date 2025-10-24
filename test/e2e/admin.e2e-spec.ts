import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AdminController } from 'src/interfaces/rest/admin.controller';
import { IngestionUseCase } from 'src/ingestion/application/use-cases/ingestion.usecase';

describe('AdminController (e2e) - /api/admin', () => {
  let app: INestApplication;
  const mockIngestionUseCase = {
    execute: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: IngestionUseCase, useValue: mockIngestionUseCase },
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

  it('POST /api/admin/ingest → retorna status 202 e chama use case', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/admin/ingest')
      .expect(202);

    expect(res.body).toEqual({ status: 'ingestion_started' });
    expect(mockIngestionUseCase.execute).toHaveBeenCalledTimes(1);
  });
});
