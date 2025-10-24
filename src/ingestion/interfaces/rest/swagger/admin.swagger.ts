import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

export function IngestDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Trigger ingestion run for all configured sources',
    }),
    ApiResponse({
      status: HttpStatus.ACCEPTED,
      description: 'Ingestion started',
    }),
  );
}
