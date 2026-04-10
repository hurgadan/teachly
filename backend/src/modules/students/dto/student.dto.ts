import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { TransformToDateString } from '../../../_common/utils/decorators/transform-to-date-string.decorator';
import { PaymentType, Student, StudentStatus } from '../../../_contracts';

export class StudentDto implements Student {
  @ApiProperty()
  @Expose()
  public id: string;

  @ApiProperty()
  @Expose()
  public firstName: string;

  @ApiProperty({ nullable: true })
  @Expose()
  public lastName: string | null;

  @ApiProperty({ nullable: true })
  @Expose()
  public phone: string | null;

  @ApiProperty({ nullable: true })
  @Expose()
  public email: string | null;

  @ApiProperty({ nullable: true })
  @Expose()
  public telegram: string | null;

  @ApiProperty({ enum: StudentStatus })
  @Expose()
  public status: StudentStatus;

  @ApiProperty()
  @Expose()
  public price: number;

  @ApiProperty()
  @Expose()
  public duration: number;

  @ApiProperty({ enum: ['prepaid', 'postpaid'] })
  @Expose()
  public paymentType: PaymentType;

  @ApiProperty()
  @Expose()
  public paymentThresholdLessons: number;

  @ApiProperty({ nullable: true })
  @Expose()
  public startDate: string | null;

  @ApiProperty({ nullable: true })
  @Expose()
  public comment: string | null;

  @ApiProperty()
  @Expose()
  @TransformToDateString()
  public createdAt: string;

  @ApiProperty()
  @Expose()
  @TransformToDateString()
  public updatedAt: string;
}
