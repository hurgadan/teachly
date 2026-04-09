import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEmail, IsString, IsTimeZone, MinLength } from 'class-validator';

import { CreateUser } from '../../../_contracts';
import { MIN_PASSWORD_LENGTH } from '../constants';

export class CreateUserDto implements CreateUser {
  @ApiProperty()
  @Expose()
  @IsEmail()
  public email: string;

  @ApiProperty()
  @Expose()
  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
  public password: string;

  @ApiProperty()
  @Expose()
  @IsTimeZone()
  public timezone: string;
}
