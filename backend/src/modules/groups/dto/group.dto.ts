import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

import { GroupMemberDto } from './group-member.dto';
import { TransformToDateString } from '../../../_common/utils/decorators/transform-to-date-string.decorator';
import { Group } from '../../../_contracts';

export class GroupDto implements Group {
  @ApiProperty()
  @Expose()
  public id: string;

  @ApiProperty()
  @Expose()
  public name: string;

  @ApiProperty()
  @Expose()
  public duration: number;

  @ApiProperty({ type: [GroupMemberDto] })
  @Expose()
  @Type(() => GroupMemberDto)
  public members: GroupMemberDto[];

  @ApiProperty()
  @Expose()
  @TransformToDateString()
  public createdAt: string;

  @ApiProperty()
  @Expose()
  @TransformToDateString()
  public updatedAt: string;
}
