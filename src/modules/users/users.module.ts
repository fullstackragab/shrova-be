import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { AuthModule } from 'src/modules/auth/auth.module';
import { Address } from './address.entity';
import { AddressService } from './address.service';
import { DefaultAddress } from './default-address.entity';
import { DefaultAddressService } from './default-address.service';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([User, Address, DefaultAddress]),
  ],
  controllers: [UsersController],
  providers: [UsersService, AddressService, DefaultAddressService],
  exports: [UsersService, AddressService, DefaultAddressService],
})
export class UsersModule {}
