import { Controller, Get, Query, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
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
  @ApiOkResponse({ description: 'Query results' })
  async find(@Query() query: QueryDataDto) {
    return this.queryDataUseCase.execute(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get data by external id' })
  @ApiOkResponse({ description: 'Found item' })
  @ApiNotFoundResponse({ description: 'Item not found' })
  async findOne(@Param('id') id: string) {
    const cleanId = id.trim();
    return this.getDataByIdUseCase.execute(cleanId);
  }
}
