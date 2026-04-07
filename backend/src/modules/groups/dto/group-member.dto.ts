import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { GroupMember } from '../../../_contracts';

export class GroupMemberDto implements GroupMember {
  @ApiProperty()
  @Expose()
  public studentId: string;

  @ApiProperty()
  @Expose()
  public firstName: string;

  @ApiProperty({ nullable: true })
  @Expose()
  public lastName: string | null;

  @ApiProperty()
  @Expose()
  public price: number;

  @ApiProperty()
  @Expose()
  public duration: number;
}
