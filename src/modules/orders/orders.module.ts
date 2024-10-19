import { Module, forwardRef } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { ShippoModule } from 'src/modules/shippo/shippo.module';
import { OrderSummary } from './order-summary.entity';
import { ProductsModule } from '../products/products.module';
import { OrdersSummaryService } from './orders_summary.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderSummary]),
    forwardRef(() => ProductsModule),
    ShippoModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersSummaryService],
  exports: [OrdersService, OrdersSummaryService],
})
export class OrdersModule {}
