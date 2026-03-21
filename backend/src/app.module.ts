import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import pinoLogger from './_common/app/app-modules/pino-logger';
import typeOrm from './_common/app/app-modules/type-orm';
import { AuthModule } from './auth/auth.module';
import config from './config';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    pinoLogger,
    typeOrm,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
