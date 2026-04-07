import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import pinoLogger from './_common/app/app-modules/pino-logger';
import typeOrm from './_common/app/app-modules/type-orm';
import config from './config';
import { AuthModule } from './modules/auth/auth.module';
import { GroupsModule } from './modules/groups/groups.module';
import { StudentsModule } from './modules/students/students.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    pinoLogger,
    typeOrm,
    AuthModule,
    StudentsModule,
    GroupsModule,
    UsersModule,
  ],
})
export class AppModule {}
