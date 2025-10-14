import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { IngestionUseCase } from '../../application/use-cases/ingestion.usecase';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly ingestionUseCase: IngestionUseCase) {}

  @Post('ingest')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Trigger ingestion run for all configured sources' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Ingestion started',
  })
  ingest() {
    void this.ingestionUseCase.execute();
    return { status: 'ingestion_started' };
  }
}
