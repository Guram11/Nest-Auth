import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @MinLength(6)
  newPassword: string;

  @IsString()
  newPasswordConfirm: string;

  @IsString()
  deviceId: string;
}
