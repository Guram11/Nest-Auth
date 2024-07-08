import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Roles, User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { Tokens } from './interfaces';
import { UpdatePasswordDto } from 'src/user/dtos/updatePassword.dto';
import { ForgotPasswordDto } from 'src/user/dtos/forgotPassword.dto';
import { ResetPasswordDto } from 'src/user/dtos/resetPassword.dto';
import { Email } from 'src/utils/email';
import { RefreshToken } from './token.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly emailService: Email,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async getTokens(id: number, role: string, deviceId: string) {
    const [user] = await this.usersRepository.find({
      relations: {
        tokens: true,
      },
      where: { id },
    });

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: id,

          role,
        },
        {
          secret: process.env.ACCESS_TOKEN_SECRET,
          expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: id,

          role,
        },
        {
          secret: process.env.REFRESH_TOKEN_SECRET,
          expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
        },
      ),
    ]);

    if (user.tokens.some((obj) => obj.deviceId === deviceId)) {
      await this.updateRtHash(id, rt);
      return {
        accessToken: at,
        refreshToken: rt,
      };
    }

    const token = this.refreshTokenRepository.create({
      accessToken: at,
      refreshToken: rt,
      userId: id,
      deviceId,
    });

    await this.refreshTokenRepository.save(token);

    return token;
  }

  async updateRtHash(id: number, rt: string): Promise<RefreshToken> {
    const token = await this.refreshTokenRepository.findOne({
      relations: {
        user: true,
      },
      where: { userId: id },
    });

    token.refreshToken = rt;

    return this.refreshTokenRepository.save(token);
  }

  async signupLocal(
    fullName: string,
    email: string,
    password: string,
    passwordConfirm: string,
    role: Roles,
    deviceId: string,
  ): Promise<Tokens> {
    // Check if email is in use
    const registeredUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (registeredUser) {
      throw new BadRequestException('Email already in use!');
    }

    // Check if password and passwordConfirm match each other
    if (password !== passwordConfirm) {
      throw new BadRequestException(
        "Password and passwordConfirm don't match each other!",
      );
    }

    // Create a new user and save it
    const user = this.usersRepository.create({
      fullName,
      email,
      password: await bcrypt.hash(password, 12),
      passwordConfirm: await bcrypt.hash(password, 12),
      role,
    });

    await this.usersRepository.save(user);

    console.log(user);

    // Generate and return Access and Refresh tokens
    const token = await this.getTokens(user.id, user.role, deviceId);

    await this.updateRtHash(user.id, token.refreshToken);

    return {
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
    };
  }

  async signinLocal(email: string, password: string, deviceId: string) {
    // Check if user exists and password is valid
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new BadRequestException('Invalid email or password!');
    }

    // Generate and return Access and Refresh tokens
    const tokens = await this.getTokens(user.id, user.role, deviceId);

    await this.updateRtHash(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(id: number, deviceId: string) {
    const token = await this.refreshTokenRepository.findOne({
      where: { deviceId },
    });

    console.log(token);

    if (!token) {
      throw new NotFoundException('No token was issued for this device!');
    }

    return this.refreshTokenRepository.remove(token);
  }

  async refreshToken(id: number, rt: string, deviceId: string) {
    // Check if user and user's Refresh token exists
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new ForbiddenException('NO user found with that id!');
    }

    // Check if provided Refresh token matches the stored one
    const token = await this.refreshTokenRepository.findOne({
      where: { deviceId },
    });

    console.log(rt);
    console.log(token.refreshToken);

    // const rtMatches = await argon.verify(rt, token.refreshToken);
    if (token.refreshToken !== rt) {
      throw new ForbiddenException('Access Denied');
    }

    // Generate and return Access and Refresh tokens
    const tokens = await this.getTokens(user.id, user.role, deviceId);
    await this.updateRtHash(user.id, tokens.refreshToken);

    return tokens;
  }

  async updatePassword(id: number, body: UpdatePasswordDto) {
    // Check if user exists and passwords are valid
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('No user found with that Id!');
    }

    if (!(await bcrypt.compare(body.passwordCurrent, user.password))) {
      throw new ForbiddenException('Current password is incorrect!');
    }

    if (body.newPassword !== body.newPasswordConfirm) {
      throw new BadRequestException(
        "Password and passwordConfirm don't match each other!",
      );
    }

    // Update passwords and save the user
    user.password = await bcrypt.hash(body.newPassword, 12);
    user.passwordConfirm = await bcrypt.hash(body.newPassword, 12);

    await this.usersRepository.save(user);

    // Generate and return Access and Refresh tokens
    const tokens = await this.getTokens(user.id, user.role, body.deviceId);
    await this.updateRtHash(user.id, tokens.refreshToken);

    return tokens;
  }

  async forgotPassword(body: ForgotPasswordDto) {
    const user = await this.usersRepository.findOne({
      where: { email: body.email },
    });

    if (!user) {
      throw new NotFoundException('No user found with that Id!');
    }

    if (user.triesLeft === 0) {
      if (user.passwordResetExpires < new Date(Date.now() - 50 * 60 * 1000)) {
        user.triesLeft = 3;
      } else {
        throw new BadRequestException(
          `You have ${user.triesLeft} tries left, try again in an hour!`,
        );
      }
    }

    const resetTokens = await this.getTokens(
      user.id,
      user.email,
      body.deviceId,
    );

    user.passwordResetToken = resetTokens.accessToken;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.triesLeft--;

    await this.usersRepository.save(user);

    const resetUrl = `http://localhost:3000/auth/resetPassword/${resetTokens.accessToken}`;

    await this.emailService.sendPasswordReset(user.email, resetUrl);

    return `Password reset url sent to your email!`;
  }

  async resetPassword(token: string, body: ResetPasswordDto) {
    const user = await this.usersRepository.findOne({
      where: { passwordResetToken: token },
    });

    if (!user) {
      throw new NotFoundException('No user found with that Id!');
    }

    if (body.newPassword !== body.newPasswordConfirm) {
      throw new BadRequestException(
        "Password and passwordConfirm don't match each other!",
      );
    }

    if (user.passwordResetExpires < new Date(Date.now())) {
      throw new BadRequestException(
        'Password reset token has expired, please try again!',
      );
    }

    user.password = await bcrypt.hash(body.newPassword, 12);
    user.passwordConfirm = await bcrypt.hash(body.newPasswordConfirm, 12);
    user.passwordChangedAt = new Date(Date.now());
    user.triesLeft = 3;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await this.usersRepository.save(user);

    // Generate and return Access and Refresh tokens
    const tokens = await this.getTokens(user.id, user.role, body.deviceId);
    await this.updateRtHash(user.id, tokens.refreshToken);

    return tokens;
  }
}
