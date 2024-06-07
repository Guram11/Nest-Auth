import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { Roles } from '../user.entity';

export class CreateUserDto {
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  passwordConfirm: string;

  @IsString()
  @IsOptional()
  refreshToken: string | null;

  @IsString()
  @IsOptional()
  role: Roles;

  @IsString()
  deviceId: string;
}
