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
} from '@nestjs/swagger';
import { QueryDataDocs } from './swagger/data.swagger';
import { QueryDataUseCase } from '../../application/use-cases/query-data.usecase';
import { QueryDataDto } from './dto/query-data.dto';
import { GetDataByIdUseCase } from 'src/dataset/application/use-cases/get-data-by-id.usecase';
import { QueryDataTransformPipe } from './pipes/query-data-transform.pipe';

@ApiTags('data')
@Controller('data')
export class DataController {
  constructor(
    private readonly queryDataUseCase: QueryDataUseCase,
    private readonly getDataByIdUseCase: GetDataByIdUseCase,
  ) {}

  @Get()
  @QueryDataDocs()
  async find(@Query(QueryDataTransformPipe) query: QueryDataDto) {
    return this.queryDataUseCase.execute(query);
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
