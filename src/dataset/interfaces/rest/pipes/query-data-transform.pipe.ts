import { Injectable, PipeTransform } from '@nestjs/common';
import { QueryDataDto } from '../dto/query-data.dto';

@Injectable()
export class QueryDataTransformPipe implements PipeTransform {
  transform(value: any): QueryDataDto {
    const adapted: QueryDataDto = { ...value };

    if (value?.pageSize && !value?.page) {
      adapted.limit = Number(value.pageSize);
    }

    if (value?.page) {
      const page = Number(value.page) || 0;
      const pageSize = Number(value.pageSize) || adapted.limit || 100;
      adapted.limit = pageSize;
      adapted.skip = Math.max(0, page * pageSize);
    }

    return adapted;
  }
}
