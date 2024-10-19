import { DeepPartial, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Address } from './address.entity';
@Injectable()
export class AddressService {
  constructor(@InjectRepository(Address) private repo: Repository<Address>) {}

  create(dto: DeepPartial<Address>) {
    const address = this.repo.create(dto);
    return this.repo.save(address);
  }

  async getAllAddresses(userId: number) {
    return await this.repo.findBy({
      userId,
    });
  }

  async getAddressesForIds(ids: number[]) {
    return await this.repo.findBy({
      id: In(ids),
    });
  }

  async update(address: DeepPartial<Address>) {
    return this.repo.save(address);
  }
}
