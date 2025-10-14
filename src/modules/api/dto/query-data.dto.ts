import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QueryDataDto {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsString() source?: string;
  @IsOptional() @IsString() city?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  availability?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceMax?: number;

  @IsOptional() @IsString() priceSegment?: string;

  @IsOptional() @IsString() sortBy?: string;
  @IsOptional() @IsIn(['asc', 'desc']) sortDir?: 'asc' | 'desc';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit = 25;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  skip = 0;
}
