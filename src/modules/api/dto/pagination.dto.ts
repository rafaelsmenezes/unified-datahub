import { IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional() @Type(() => Number) @IsNumber() limit = 50;
  @IsOptional() @Type(() => Number) @IsNumber() skip = 0;
}
