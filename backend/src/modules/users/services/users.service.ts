import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcrypt';

import { PASSWORD_SALT } from '../constants';
import { UserEntity } from '../dao/user.entity';
import { WorkScheduleEntity } from '../dao/work-schedule.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdateWorkScheduleDto } from '../dto/update-work-schedule.dto';
import { UserTimezoneChangedEvent } from '../events/user-timezone-changed.event';
import { UsersRepository } from '../repositories/users.repository';
import { WorkScheduleRepository } from '../repositories/work-schedule.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly workScheduleRepository: WorkScheduleRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findOneByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ email });
  }

  async create(data: CreateUserDto): Promise<UserEntity> {
    return await this.usersRepository.create({
      ...data,
      passwordHash: await bcrypt.hash(data.password, PASSWORD_SALT),
    });
  }

  async getProfile(userId: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOneWithSchedules({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(userId: string, data: UpdateProfileDto): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersRepository.update(userId, data);

    if (data.timezone && data.timezone !== user.timezone) {
      await this.eventEmitter.emitAsync(
        UserTimezoneChangedEvent.EVENT_NAME,
        new UserTimezoneChangedEvent(userId, user.timezone, data.timezone),
      );
    }

    return this.getProfile(userId);
  }

  async getWorkSchedule(userId: string): Promise<WorkScheduleEntity[]> {
    return this.workScheduleRepository.findByTeacherId(userId);
  }

  async updateWorkSchedule(
    userId: string,
    data: UpdateWorkScheduleDto,
  ): Promise<WorkScheduleEntity[]> {
    const user = await this.usersRepository.findOne({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const items = data.schedules.map((s) => ({
      teacherId: userId,
      dayOfWeek: s.dayOfWeek,
      isWorkday: s.isWorkday,
      intervals: s.intervals,
    }));

    await this.workScheduleRepository.upsertMany(userId, items);

    return this.workScheduleRepository.findByTeacherId(userId);
  }
}
