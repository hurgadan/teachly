import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

import { Language, UpdateProfile } from '../../../_contracts';
import { BUFFER_MAX_MINUTES, BUFFER_MIN_MINUTES } from '../constants';

export class UpdateProfileDto implements UpdateProfile {
  @ApiPropertyOptional({ enum: Language })
  @Expose()
  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @ApiPropertyOptional()
  @Expose()
  @IsOptional()
  @IsInt()
  @Min(BUFFER_MIN_MINUTES)
  @Max(BUFFER_MAX_MINUTES)
  bufferMinutesAfterLesson?: number;
}
