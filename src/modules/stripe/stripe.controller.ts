import {
  Controller,
  Headers,
  InternalServerErrorException,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { PaymentIntentsService } from 'src/modules/stripe/payment-intents.service';
import { CartService } from '../cart/cart.service';

import { config } from 'dotenv';
import { OrdersSummaryService } from 'src/modules/orders/orders_summary.service';
import { ShippoService } from '../shippo/shippo.service';
import { OrdersService } from 'src/modules/orders/orders.service';
config();

const stripe = require('stripe')(`${process.env.STRIPE_SECRET_KEY}`);
const endpointSecret = `${process.env.STRIPE_WEBHOOK_SECRET_KEY}`;

@Controller('stripe')
export class StripeController {
  constructor(
    private paymentIntentsService: PaymentIntentsService,
    private cartService: CartService,
    private orderSummaryService: OrdersSummaryService,
    private shippoService: ShippoService,
    private orderService: OrdersService,
  ) {}

  @Post('webhook')
  async webhook(@Req() req: RawBodyRequest<Request>, @Headers() headers) {
    const sig = headers['stripe-signature'];
    let result: any = true;
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err) {
      return `Webhook Error: ${err.message}`;
    }

    switch (event.type) {
      case 'checkout.session.completed':
        result = await this.paymentIntentsService.createPaymentIntent(
          event.data.object.metadata.userId,
          event.data.object.metadata.summaryId,
          event.data.object.payment_intent,
        );
        break;
      case 'payment_intent.succeeded':
        try {
          setTimeout(async () => {
            const paymentIntentSucceeded = event.data.object;
            const paymentIntentObj =
              await this.paymentIntentsService.findOneByPaymentIntentId(
                paymentIntentSucceeded.id,
              );
            if (paymentIntentObj) {
              const orderSummary =
                await this.orderSummaryService.getOrderSummary(
                  paymentIntentObj.summaryId,
                );
              const transObj = await this.shippoService.createTransaction(
                orderSummary.rateId,
              );
              await this.orderService.create({
                userId: paymentIntentObj.userId,
                items: orderSummary.items,
                transObjId: transObj.objectId,
                paymentIntentId: paymentIntentObj.paymentIntentId,
                summaryId: orderSummary.id,
                labelUrl: transObj.labelUrl,
                orderDate: orderSummary.orderDate,
                total: orderSummary.total,
                trackingNumber: transObj.trackingNumber,
                trackingUrl: transObj.trackingUrlProvider,
              });
              this.paymentIntentsService.delete(
                paymentIntentObj.paymentIntentId,
              );
              this.cartService.delete(paymentIntentObj.userId);
            } else {
              throw new InternalServerErrorException(
                'Payment intent not found!',
              );
            }
          }, 2000);
        } catch (e) {
          console.log('ERROR PAYMENT SUCCESS: ', e);
        }
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    return result;
  }
}
