import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto } from 'src/user/dtos/createUser.dto';
import { SigninUserDto } from 'src/user/dtos/signinUser.dto';
import { AuthService } from './auth.service';
import { Tokens } from './interfaces/tokens.interface';
import { Request } from 'express';
import { AtGuard } from 'src/guards/at.guard';
import { RtGuard } from 'src/guards/rt.guard';
import { UpdatePasswordDto } from 'src/user/dtos/updatePassword.dto';
import { ForgotPasswordDto } from 'src/user/dtos/forgotPassword.dto';
import { ResetPasswordDto } from 'src/user/dtos/resetPassword.dto';
import { LogoutDto } from 'src/user/dtos/logout.dto';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/local/signup')
  public createUser(@Body() body: CreateUserDto): Promise<Tokens> {
    return this.authService.signupLocal(
      body.fullName,
      body.email,
      body.password,
      body.passwordConfirm,
      body.role,
      body.deviceId,
    );
  }

  @Post('/local/signin')
  @HttpCode(HttpStatus.OK)
  public signinLocal(@Body() body: SigninUserDto): Promise<Tokens> {
    return this.authService.signinLocal(
      body.email,
      body.password,
      body.deviceId,
    );
  }

  @UseGuards(AtGuard)
  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  logout(@Req() req: Request, @Body() body: LogoutDto) {
    return this.authService.logout(req.user['sub'], body.deviceId);
  }

  @UseGuards(RtGuard)
  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  public refreshTokens(@Req() req: Request, @Body() body): Promise<Tokens> {
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];
    return this.authService.refreshToken(userId, refreshToken, body.deviceId);
  }

  @UseGuards(AtGuard)
  @Patch('/updatePassword')
  updatePassword(@Body() body: UpdatePasswordDto, @Req() req: Request) {
    const userId = req.user['sub'];
    return this.authService.updatePassword(userId, body);
  }

  @Post('/forgotPassword')
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body);
  }

  @Patch('/resetPassword/:token')
  resetPassword(@Param('token') token: string, @Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(token, body);
  }
}
