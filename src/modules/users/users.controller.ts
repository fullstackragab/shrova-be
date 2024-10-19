import {
  Body,
  Controller,
  Get,
  Param,
  NotFoundException,
  UseGuards,
  Put,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from './current-user.decorator';
import { User } from './user.entity';
import { JwtGuard } from '../auth/guards/jwt-auth.guard';
import { AddressService } from './address.service';
import { DefaultAddressService } from './default-address.service';
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private addressService: AddressService,
    private defaultAddressService: DefaultAddressService,
  ) {}

  @Get('profile')
  @UseGuards(JwtGuard)
  getProfile(@CurrentUser() user: User) {
    return this.usersService.getProfile(user);
  }

  @Get('address')
  @UseGuards(JwtGuard)
  getAddresses(@CurrentUser() user: User) {
    return this.addressService.getAllAddresses(user.id);
  }

  @Post('address')
  @UseGuards(JwtGuard)
  async addAddress(@CurrentUser() user: User, @Body() address) {
    const result = await this.addressService.create({
      userId: user.id,
      ...address,
    });
    if (address.isDefault) {
      return await this.defaultAddressService.setDefaultAddress(
        result.userId,
        result.id,
        result.type,
      );
    } else {
      return result;
    }
  }

  @Post('set-default-address')
  @UseGuards(JwtGuard)
  setDefaultAddress(@CurrentUser() user: User, @Body() body) {
    return this.defaultAddressService.setDefaultAddress(
      user.id,
      body.addressId,
      body.addressType,
    );
  }

  @Get('get-default-address')
  @UseGuards(JwtGuard)
  async getDefaultAddress(
    @CurrentUser() user: User,
    @Query('addressType') addressType,
  ) {
    const obj: any = await this.defaultAddressService.getDefaultAddress(
      user.id,
      addressType,
    );
    let ids: any[] = [];
    if (Array.isArray(obj)) {
      ids = obj.map((t: any) => t.addressId);
    } else {
      ids = [obj.addressId];
    }
    const adrs = await this.addressService.getAddressesForIds(ids);
    return adrs;
  }

  @Put('profile')
  @UseGuards(JwtGuard)
  updateUser(
    @CurrentUser() user: User,
    @Body()
    body: {
      firstname?: string;
      lastname?: string;
    },
  ) {
    return this.usersService.updateProfile(
      user.id,
      body.firstname,
      body.lastname,
    );
  }

  @Get(':id')
  async findUser(@Param('id') id: string) {
    const user = await this.usersService.findOneById(parseInt(id));
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
