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
import { GetDataByIdUseCase } from 'src/application/use-cases/get-data-by-id.usecase';

@ApiTags('data')
@Controller('data')
export class DataController {
  constructor(
    private readonly queryDataUseCase: QueryDataUseCase,
    private readonly getDataByIdUseCase: GetDataByIdUseCase,
  ) {}

  @Get()
  @QueryDataDocs()
  async find(@Query() query: QueryDataDto, @Query() rawQuery: any) {
    const adapted = this.adaptQuery(query, rawQuery);
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

  private adaptQuery(query: QueryDataDto, rawQuery: any): QueryDataDto {
    const adapted: QueryDataDto = { ...query };

    if (rawQuery?.pageSize !== undefined && rawQuery?.page === undefined) {
      adapted.limit = Number(rawQuery.pageSize);
    }

    if (rawQuery?.page !== undefined) {
      const page = Number(rawQuery.page) || 0;
      const pageSize = Number(rawQuery.pageSize) || adapted.limit || 100;
      adapted.limit = pageSize;
      adapted.skip = Math.max(0, page * pageSize);
    }

    return adapted;
  }
}
