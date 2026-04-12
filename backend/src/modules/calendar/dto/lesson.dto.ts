import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { Lesson, LessonStatus, LessonTargetType } from '../../../_contracts/calendar';

export class LessonDto implements Lesson {
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
  public startAt: string;

  @ApiProperty()
  @Expose()
  public duration: number;

  @ApiProperty({ enum: LessonStatus })
  @Expose()
  public status: LessonStatus;

  @ApiProperty()
  @Expose()
  public recurring: boolean;

  @ApiProperty({ nullable: true })
  @Expose()
  public recurringLessonId: string | null;
}
