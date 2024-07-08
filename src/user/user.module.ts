import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { RefreshToken } from 'src/auth/token.entity';
import { UserRepository } from './repositories/user.repository';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, RefreshToken])],
  controllers: [UserController],
  providers: [
    {
      provide: 'userRepository',
      useValue: UserRepository,
    },
    UserService,
  ],
})
export class UserModule {}
