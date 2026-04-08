import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './controllers/users.controller';
import { UserEntity } from './dao/user.entity';
import { WorkScheduleEntity } from './dao/work-schedule.entity';
import { UsersRepository } from './repositories/users.repository';
import { WorkScheduleRepository } from './repositories/work-schedule.repository';
import { UsersService } from './services/users.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, WorkScheduleEntity]), EventEmitterModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, WorkScheduleRepository],
  exports: [UsersService],
})
export class UsersModule {}
