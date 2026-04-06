import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RequestExtended } from '../../../_common/types';
import { transformToDto } from '../../../_common/utils/transform-to-dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateUserDto } from '../dto/create-user.dto';
import { TeacherProfileDto } from '../dto/teacher-profile.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdateWorkScheduleDto } from '../dto/update-work-schedule.dto';
import { UserDto } from '../dto/user.dto';
import { WorkScheduleDto } from '../dto/work-schedule.dto';
import { UsersService } from '../services/users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create user (register)' })
  @ApiOkResponse({ type: UserDto })
  public async createUser(@Body() data: CreateUserDto): Promise<UserDto> {
    const user = await this.usersService.create(data);
    return transformToDto(UserDto, user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current teacher profile' })
  @ApiOkResponse({ type: TeacherProfileDto })
  public async getProfile(
    @Request() req: RequestExtended,
  ): Promise<TeacherProfileDto> {
    const user = await this.usersService.getProfile(req.user!.id);
    return transformToDto(TeacherProfileDto, user);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update teacher profile' })
  @ApiOkResponse({ type: TeacherProfileDto })
  public async updateProfile(
    @Request() req: RequestExtended,
    @Body() data: UpdateProfileDto,
  ): Promise<TeacherProfileDto> {
    const user = await this.usersService.updateProfile(req.user!.id, data);
    return transformToDto(TeacherProfileDto, user);
  }

  @Get('me/work-schedule')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get work schedule' })
  @ApiOkResponse({ type: [WorkScheduleDto] })
  public async getWorkSchedule(
    @Request() req: RequestExtended,
  ): Promise<WorkScheduleDto[]> {
    const schedules = await this.usersService.getWorkSchedule(req.user!.id);
    return schedules.map((s) => transformToDto(WorkScheduleDto, s));
  }

  @Put('me/work-schedule')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update work schedule' })
  @ApiOkResponse({ type: [WorkScheduleDto] })
  public async updateWorkSchedule(
    @Request() req: RequestExtended,
    @Body() data: UpdateWorkScheduleDto,
  ): Promise<WorkScheduleDto[]> {
    const schedules = await this.usersService.updateWorkSchedule(
      req.user!.id,
      data,
    );
    return schedules.map((s) => transformToDto(WorkScheduleDto, s));
  }
}
