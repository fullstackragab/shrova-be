import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  InternalServerErrorException,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RefreshJwtGuard } from './guards/refresh-jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return await this.authService.login(req.user);
  }

  @Post('register')
  async registerUser(
    @Body()
    body: {
      firstname: string;
      lastname: string;
      email: string;
      password: string;
    },
  ) {
    let user = await this.userService.findOneByEmail(body.email);
    if (user) {
      throw new BadRequestException('email in use');
    }

    const salt = await this.authService.getRandomSalt();

    const encryptedPassword = await this.authService.getSaltedAndHashedPassword(
      salt,
      body.password,
    );

    user = await this.userService.create(
      body.firstname,
      body.lastname,
      body.email,
      encryptedPassword,
    );
    if (user) {
      return await this.authService.login(user);
    }
    throw new InternalServerErrorException('Error creating user!');
  }

  @UseGuards(RefreshJwtGuard)
  @Post('refresh')
  async refrshToken(@Request() req) {
    return this.authService.refreshToken(req.user);
  }

  @Post('request-reset-password')
  requestResetPassword(@Body() body, @Headers() headers) {
    return this.authService.requestResetPassword(body.email, headers.origin);
  }

  @Post('reset-password')
  resetPassword(@Body() body) {
    return this.authService.resetPassword(
      body.email,
      body.token,
      body.password,
    );
  }
}
