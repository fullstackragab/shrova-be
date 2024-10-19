import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { DefaultAddress } from './default-address.entity';
@Injectable()
export class DefaultAddressService {
  constructor(
    @InjectRepository(DefaultAddress) private repo: Repository<DefaultAddress>,
  ) {}

  async setDefaultAddress(
    userId: number,
    addressId: number,
    addressType: number,
  ) {
    const defaultAddress = await this.repo.findOneBy({
      userId,
      addressType,
    });
    if (defaultAddress) {
      defaultAddress.addressId = addressId;
      return this.repo.save(defaultAddress);
    } else {
      const newAddress = this.repo.create({
        addressId,
        addressType,
        userId,
      });
      return this.repo.save(newAddress);
    }
  }

  async getDefaultAddress(userId: number, addressType?: number) {
    if (addressType) {
      let results = await this.repo.findBy({
        userId,
        addressType,
      });
      if (results && results.length > 0) return results[0];
      results = await this.repo.findBy({
        userId,
      });
      if (results && results.length > 0) return results[0];
    } else {
      return this.repo.findBy({
        userId,
      });
    }
  }
}
