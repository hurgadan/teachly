import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import { UpdateGroup } from '../../../_contracts';
import { GROUP_DURATION_MAX, GROUP_DURATION_MIN, GROUP_NAME_MAX_LENGTH } from '../constants';

export class UpdateGroupDto implements UpdateGroup {
  @ApiPropertyOptional()
  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(GROUP_NAME_MAX_LENGTH)
  public name?: string;

  @ApiPropertyOptional()
  @Expose()
  @IsOptional()
  @IsInt()
  @Min(GROUP_DURATION_MIN)
  @Max(GROUP_DURATION_MAX)
  public duration?: number;

  @ApiPropertyOptional({ type: [String] })
  @Expose()
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  public studentIds?: string[];
}
