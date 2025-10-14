import {
  Controller,
  Get,
  Query,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { ApiService } from './api.service';
import { QueryDataDto } from './dto/query-data.dto';

@Controller('data')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Get()
  async find(@Query() query: QueryDataDto) {
    return this.apiService.queryData(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const res = await this.apiService.findByIdOrExternal(id);
    if (!res) throw new NotFoundException(`Data not found: ${id}`);
    return res;
  }
}
