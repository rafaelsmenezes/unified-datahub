import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryDataDto {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsString() source?: string;
  @IsOptional() @IsString() city?: string;

  @ApiPropertyOptional({ type: 'boolean' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  availability?: boolean;

  @ApiPropertyOptional({ type: 'number' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceMin?: number;

  @ApiPropertyOptional({ type: 'number' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceMax?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  priceSegment?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDir?: 'asc' | 'desc';

  @ApiPropertyOptional({ type: 'number', default: 25 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit = 25;

  @ApiPropertyOptional({ type: 'number', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  skip = 0;
}
