import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

import pinoLogger from './_common/app/app-modules/pino-logger';
import typeOrm from './_common/app/app-modules/type-orm';
import config from './config';
import { AuthModule } from './modules/auth/auth.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { GroupsModule } from './modules/groups/groups.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { StudentsModule } from './modules/students/students.module';
import { UsersModule } from './modules/users/users.module';

//

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    pinoLogger,
    typeOrm,
    AuthModule,
    CalendarModule,
    StudentsModule,
    GroupsModule,
    PaymentsModule,
    UsersModule,
  ],
})
export class AppModule {}
