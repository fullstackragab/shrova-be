import { Injectable } from '@nestjs/common';
import { Cart } from './cart.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private repo: Repository<Cart>,
  ) {}

  async save(userId: number, cart: string) {
    let found = await this.repo.findOne({
      where: {
        userId,
      },
    });
    if (found) {
      found.cart = cart;
      return this.repo.save(found);
    } else {
      found = this.repo.create({
        userId,
        cart,
      });
      return this.repo.save(found);
    }
  }

  async get(userId: number) {
    return await this.repo.findOne({
      where: {
        userId,
      },
    });
  }

  async delete(userId: number) {
    const found = await this.get(userId);
    if (found) {
      console.log('deleting cart ... ', userId);
      return await this.repo.remove(found);
    }
  }
}
