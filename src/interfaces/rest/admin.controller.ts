import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { IngestionUseCase } from '../../application/use-cases/ingestion.usecase';

@Controller('admin')
export class AdminController {
  constructor(private readonly ingestionUseCase: IngestionUseCase) {}

  @Post('ingest')
  @HttpCode(HttpStatus.ACCEPTED)
  ingest() {
    void this.ingestionUseCase.execute();
    return { status: 'ingestion_started' };
  }
}
