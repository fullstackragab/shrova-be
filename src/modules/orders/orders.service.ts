import { Injectable } from '@nestjs/common';
import { Order } from './order.entity';
import { DeepPartial, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class OrdersService {
  constructor(@InjectRepository(Order) private repo: Repository<Order>) {}

  create(order: DeepPartial<Order>) {
    return this.repo.save(order);
  }

  getAll(userId: number, take: number, skip: number) {
    return this.repo.findAndCount({
      where: {
        userId,
      },
      take,
      skip,
    });
  }

  getOrderById(userId: number, orderId: number) {
    return this.repo.findOneBy({
      userId,
      id: orderId,
    });
  }
}
