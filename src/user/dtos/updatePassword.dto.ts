import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  passwordCurrent: string;

  @IsString()
  @MinLength(6)
  newPassword: string;

  @IsString()
  newPasswordConfirm: string;

  @IsString()
  deviceId: string;
}
