import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { MailerModule } from './modules/mailer/mailer.module';
import { NewsletterModule } from './modules/newsletter/newsletter.module';
import { CartModule } from './modules/cart/cart.module';
import { ShippoModule } from './modules/shippo/shippo.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { StoreSettingsModule } from './modules/store-settings/store-settings.module';
import { OrdersModule } from './modules/orders/orders.module';
import { StorageModule } from './modules/storage/storage.module';
import { User } from './modules/users/user.entity';
import { StoreSettings } from './modules/store-settings/store-settings.entity';
import { Category } from './modules/categories/category.entity';
import { Cart } from './modules/cart/cart.entity';
import { Product } from './modules/products/product.entity';
import { ProductFile } from './modules/products/product-file.entity';
import { Newsletter } from './modules/newsletter/newsletter.entity';
import { Order } from './modules/orders/order.entity';
import { File } from './modules/storage/file.entity';
import { PaymentIntent } from './modules/stripe/payment-intent.entity';
import { Address } from './modules/users/address.entity';
import { DefaultAddress } from './modules/users/default-address.entity';
import { OrderSummary } from './modules/orders/order-summary.entity';
config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: `${process.env.POSTGRES_HOST}`,
      port: +`${process.env.POSTGRES_PORT}`,
      username: `${process.env.POSTGRES_USER}`,
      password: `${process.env.POSTGRES_PASSWORD}`,
      database: `${process.env.POSTGRES_DATABASE}`,
      entities: [
        User,
        StoreSettings,
        Category,
        Cart,
        Product,
        ProductFile,
        Newsletter,
        Order,
        File,
        PaymentIntent,
        Address,
        DefaultAddress,
        OrderSummary,
      ],
      // entities: [__dirname + '/**/*.entity.{ts,js}'],
      ssl: `${process.env.POSTGRES_SSL}`.toLowerCase() == 'true',
      synchronize: false,
    }),
    UsersModule,
    AuthModule,
    MailerModule,
    NewsletterModule,
    CartModule,
    StripeModule,
    ShippoModule,
    ProductsModule,
    CategoriesModule,
    StoreSettingsModule,
    OrdersModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
