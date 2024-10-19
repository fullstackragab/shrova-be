import { Module, forwardRef } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentIntent } from './payment-intent.entity';
import { PaymentIntentsService } from './payment-intents.service';
import { CartModule } from '../cart/cart.module';
import { UsersModule } from '../users/users.module';
import { OrdersModule } from 'src/modules/orders/orders.module';
import { ShippoModule } from '../shippo/shippo.module';

@Module({
  imports: [
    forwardRef(() => CartModule),
    forwardRef(() => UsersModule),
    TypeOrmModule.forFeature([PaymentIntent]),
    OrdersModule,
    ShippoModule,
  ],
  controllers: [StripeController],
  providers: [PaymentIntentsService, StripeService],
  exports: [StripeService],
})
export class StripeModule {}
