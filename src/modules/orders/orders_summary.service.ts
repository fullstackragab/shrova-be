import { Injectable } from '@nestjs/common';
import { DeepPartial, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderSummary } from './order-summary.entity';

@Injectable()
export class OrdersSummaryService {
  constructor(
    @InjectRepository(OrderSummary) private repo: Repository<OrderSummary>,
  ) {}

  create(summary: DeepPartial<OrderSummary>) {
    return this.repo.save(summary);
  }

  async getOrderSummary(summaryId: number) {
    return await this.repo.findOneBy({
      id: summaryId,
    });
  }
}
