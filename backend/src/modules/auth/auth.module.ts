import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import type { StringValue } from 'ms';

import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt-strategy';
import { LocalStrategy } from './strategies/local-strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('jwtSecret');
        const signOptions = {
          expiresIn: configService.get<StringValue>('accessTokenExpires'),
        };

        if (!secret || !signOptions.expiresIn) {
          throw new Error('jwtSecret or accessTokenExpires envs is missing');
        }

        return {
          secret,
          signOptions,
        };
      },
      inject: [ConfigService],
    }),
    PassportModule.register({ session: false }),
    UsersModule,
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
