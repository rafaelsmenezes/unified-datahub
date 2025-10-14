import {
  Controller,
  Get,
  Query,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { QueryDataUseCase } from '../../application/use-cases/query-data.usecase';
import { QueryDataDto } from './dto/query-data.dto';
import { GetDataByIdUseCase } from 'src/application/use-cases/get-data-by-id.usecase';

@Controller('data')
export class ApiController {
  constructor(
    private readonly queryDataUseCase: QueryDataUseCase,
    private readonly getDataByIdUseCase: GetDataByIdUseCase,
  ) {}

  @Get()
  async find(@Query() query: QueryDataDto) {
    return this.queryDataUseCase.execute(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const cleanId = id.trim();
    return this.getDataByIdUseCase.execute(cleanId);
  }
}
