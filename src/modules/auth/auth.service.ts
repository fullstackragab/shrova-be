import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { User } from 'src/modules/users/user.entity';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from 'src/modules/mailer/mailer.service';

import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async validateUser(email: string, userPassword: string) {
    const user = await this.userService.findOneByEmail(email);
    if (user) {
      const [salt, storedHash] = user.password.split('.');
      const hash = await this.getHashAsString(userPassword, salt);
      if (storedHash !== hash) {
        throw new BadRequestException('Wrong password!');
      }
      const { password, ...result } = user;
      return result;
    }
    throw new NotFoundException('User not found!');
  }

  async login(user: User) {
    const payload = {
      sub: {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    };
    return {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
      isAdmin: user.isAdmin,
    };
  }

  async refreshToken(user: User) {
    const payload = {
      sub: {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async requestResetPassword(email: string, origin: string) {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const salt = await this.getRandomSalt();
    const hash = await this.getSaltedAndHashedPassword(salt, email);
    user.resetPasswordToken = hash;
    user.tokenCreatedAt = new Date();
    await this.userService.updateResetPasswordToken(user.id, user);
    this.mailerService.sendResetEmail(email, hash, origin);
    return HttpStatus.OK;
  }

  async resetPassword(email: string, token: string, password: string) {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (token !== user.resetPasswordToken) {
      throw new BadRequestException('Invalid or expired password reset token');
    }
    const timeDifference = Math.abs(
      new Date().getTime() - user.tokenCreatedAt.getTime(),
    );
    let differentHours = Math.ceil(timeDifference / (1000 * 3600));
    if (differentHours > 1) {
      throw new BadRequestException('Invalid or expired password reset token');
    }
    const salt = await this.getRandomSalt();
    const newPassword = await this.getSaltedAndHashedPassword(salt, password);
    user.resetPasswordToken = null;
    user.tokenCreatedAt = null;
    user.password = newPassword;
    return this.userService.update(user);
  }

  async getRandomSalt() {
    return randomBytes(8).toString('hex');
  }

  async getHashAsString(password: string, salt: string) {
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    return hash.toString('hex');
  }

  async getSaltedAndHashedPassword(salt: string, password: string) {
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    return salt + '.' + hash.toString('hex');
  }
}
