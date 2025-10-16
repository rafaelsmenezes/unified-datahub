import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { IngestionUseCase } from '../../application/use-cases/ingestion.usecase';
import { ApiTags } from '@nestjs/swagger';
import { IngestDocs } from './swagger/admin.swagger';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly ingestionUseCase: IngestionUseCase) {}

  @Post('ingest')
  @HttpCode(HttpStatus.ACCEPTED)
  @IngestDocs()
  ingest() {
    void this.ingestionUseCase.execute();
    return { status: 'ingestion_started' };
  }
}
