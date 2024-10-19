import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentIntent } from './payment-intent.entity';

@Injectable()
export class PaymentIntentsService {
  constructor(
    @InjectRepository(PaymentIntent)
    private repo: Repository<PaymentIntent>,
  ) {}

  createPaymentIntent(
    userId: number,
    summaryId: number,
    paymentIntentId: string,
  ) {
    const paymentIntent = this.repo.create({
      userId,
      summaryId,
      paymentIntentId,
    });
    return this.repo.save(paymentIntent);
  }

  findOneByPaymentIntentId(paymentIntentId: string) {
    if (!paymentIntentId) {
      throw new NotFoundException(
        "Can't find a payment intent with the id: ",
        paymentIntentId,
      );
    }
    return this.repo.findOneBy({ paymentIntentId });
  }

  async delete(paymentIntentId: string) {
    return await this.repo.delete({ paymentIntentId });
  }
}
