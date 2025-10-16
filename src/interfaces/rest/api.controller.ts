import {
  Controller,
  Get,
  Query,
  Param,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { QueryDataUseCase } from '../../application/use-cases/query-data.usecase';
import { QueryDataDto } from './dto/query-data.dto';
import { GetDataByIdUseCase } from 'src/application/use-cases/get-data-by-id.usecase';

@ApiTags('data')
@Controller('data')
export class ApiController {
  constructor(
    private readonly queryDataUseCase: QueryDataUseCase,
    private readonly getDataByIdUseCase: GetDataByIdUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Query unified data' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description:
      'Page index (0-based). If provided, `pageSize` is used as limit',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Page size; when used alone it maps to `limit`',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of items to return (default 100, max 1000)',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of items to skip (default 0)',
  })
  @ApiOkResponse({ description: 'Query results' })
  async find(@Query() query: QueryDataDto, @Query() rawQuery: any) {
    // support aliases: page & pageSize
    const adapted: any = { ...query };

    if (rawQuery?.pageSize !== undefined && rawQuery?.page === undefined) {
      // pageSize provided without page -> interpret as limit
      adapted.limit = Number(rawQuery.pageSize);
    }

    if (rawQuery?.page !== undefined) {
      const page = Number(rawQuery.page) || 0;
      const pageSize = Number(rawQuery.pageSize) || adapted.limit || 100;
      adapted.limit = pageSize;
      adapted.skip = Math.max(0, page * pageSize);
    }

    return this.queryDataUseCase.execute(adapted);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get data by UUID id' })
  @ApiOkResponse({ description: 'Found item' })
  @ApiNotFoundResponse({ description: 'Item not found' })
  async findOne(@Param('id') id: string) {
    const cleanId = id.trim();
    const data = await this.getDataByIdUseCase.execute(cleanId);
    if (!data) {
      throw new NotFoundException(`Item with id ${cleanId} not found`);
    }
    return data;
  }
}
