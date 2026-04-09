import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

import { LessonDto } from './lesson.dto';
import { PaginatedResponse } from '../../../_contracts';

export class PaginatedLessonsDto implements PaginatedResponse<LessonDto> {
  @ApiProperty({ type: [LessonDto] })
  @Expose()
  @Type(() => LessonDto)
  public items: LessonDto[];

  @ApiProperty()
  @Expose()
  public total: number;

  @ApiProperty()
  @Expose()
  public page: number;

  @ApiProperty()
  @Expose()
  public limit: number;
}
