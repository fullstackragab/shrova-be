import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
config();

@Injectable()
export class StripeService {
  async checkout(
    userId: number,
    items: {
      id: number;
      name: string;
      price: number;
      imageUrl: string;
      quantity: number;
    }[],
    summaryId: number,
    rate: any,
    headers: any,
  ) {
    const stripe = require('stripe')(`${process.env.STRIPE_SECRET_KEY}`);
    const ids = items.map((item) => item.id).join(',');
    const lineItems = [];
    items.forEach((item) => {
      const unit_amount = Math.round(item.price * 100);
      const lineItem = {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: [item.imageUrl],
          },
          unit_amount,
        },
        quantity: item.quantity,
      };
      lineItems.push(lineItem);
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: rate.amount * 100,
              currency: rate.currency,
            },
            display_name: rate.provider + ', ' + rate.servicelevel.name,
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: rate.estimatedDays,
              },
              maximum: {
                unit: 'business_day',
                value: rate.estimatedDays + 1,
              },
            },
          },
        },
      ],
      line_items: lineItems,
      mode: 'payment',
      success_url: headers.origin + '/success',
      cancel_url: headers.origin + '/cancel',
      metadata: {
        userId,
        summaryId,
      },
    });

    return { id: session.id, bookId: ids };
  }

  getIdsAsArray(ids: string) {
    let idsAr = [];
    if (ids) {
      if (ids.includes(',')) {
        idsAr = ids.split(',').map((t) => +t.trim());
      } else {
        idsAr = [+ids.trim()];
      }
    }
    return idsAr;
  }
}
