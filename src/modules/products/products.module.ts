import { Module, forwardRef } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeModule } from 'src/modules/stripe/stripe.module';
import { JwtModule } from '@nestjs/jwt';
import { ShippoModule } from 'src/modules/shippo/shippo.module';
import { StoreSettingsModule } from 'src/modules/store-settings/store-settings.module';
import { OrdersModule } from '../orders/orders.module';
import { ProductFile } from './product-file.entity';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    ShippoModule,
    forwardRef(() => StripeModule),
    forwardRef(() => OrdersModule),
    forwardRef(() => StorageModule),
    JwtModule,
    TypeOrmModule.forFeature([Product, ProductFile]),
    StoreSettingsModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
