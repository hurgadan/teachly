import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { CalendarLesson, LessonStatus, LessonTargetType } from '../../../_contracts/calendar';

export class CalendarLessonDto implements CalendarLesson {
  @ApiProperty()
  @Expose()
  public id: string;

  @ApiProperty({ enum: LessonTargetType })
  @Expose()
  public type: LessonTargetType;

  @ApiProperty()
  @Expose()
  public entityId: string;

  @ApiProperty()
  @Expose()
  public title: string;

  @ApiProperty()
  @Expose()
  public date: string;

  @ApiProperty()
  @Expose()
  public startTime: string;

  @ApiProperty()
  @Expose()
  public endTime: string;

  @ApiProperty()
  @Expose()
  public duration: number;

  @ApiProperty({ enum: LessonStatus })
  @Expose()
  public status: LessonStatus;

  @ApiProperty()
  @Expose()
  public recurring: boolean;
}
