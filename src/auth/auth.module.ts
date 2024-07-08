import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { AtStrategy } from './strategies/at.strategy';
import { RtStrategy } from './strategies/rt.strategy';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Email } from 'src/utils/email';
import { RefreshToken } from './token.entity';
import { UserRepository } from 'src/user/repositories/user.repository';

@Module({
  imports: [
    UserModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([User, RefreshToken]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    AtStrategy,
    RtStrategy,
    JwtService,
    Email,
    UserRepository,
  ],
})
export class AuthModule {}
