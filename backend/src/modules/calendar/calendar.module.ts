import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GroupsModule } from '../groups/groups.module';
import { StudentsModule } from '../students/students.module';
import { UsersModule } from '../users/users.module';
import { CalendarController } from './controllers/calendar.controller';
import { LessonEntity } from './dao/lesson.entity';
import { RecurringLessonEntity } from './dao/recurring-lesson.entity';
import { LessonsRepository } from './repositories/lessons.repository';
import { RecurringLessonsRepository } from './repositories/recurring-lessons.repository';
import { CalendarService } from './services/calendar.service';
import { LessonsMaterializerService } from './services/lessons-materializer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([LessonEntity, RecurringLessonEntity]),
    UsersModule,
    StudentsModule,
    GroupsModule,
  ],
  controllers: [CalendarController],
  providers: [
    LessonsRepository,
    RecurringLessonsRepository,
    CalendarService,
    LessonsMaterializerService,
  ],
  exports: [CalendarService],
})
export class CalendarModule {}
