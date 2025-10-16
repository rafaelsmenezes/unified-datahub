import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiQuery } from '@nestjs/swagger';

export function QueryDataDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Query unified data' }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description:
        'Page index (0-based). If provided, `pageSize` is used as limit',
      example: 0,
    }),
    ApiQuery({
      name: 'pageSize',
      required: false,
      type: Number,
      description: 'Page size; when used alone it maps to `limit`',
      example: 10,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Maximum number of items to return (default 100, max 1000)',
      example: 50,
    }),
    ApiQuery({
      name: 'skip',
      required: false,
      type: Number,
      description: 'Number of items to skip (default 0)',
      example: 0,
    }),
    ApiOkResponse({ description: 'Query results' }),
  );
}
