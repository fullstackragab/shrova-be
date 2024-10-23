import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { StripeService } from 'src/modules/stripe/stripe.service';
import { JwtGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/modules/users/current-user.decorator';
import { User } from 'src/modules/users/user.entity';
import { ShippoService } from 'src/modules/shippo/shippo.service';
import {
  DistanceUnitEnum,
  ParcelCreateRequest,
  WeightUnitEnum,
} from 'shippo/models/components';
import { StoreSettingsService } from 'src/modules/store-settings/store-settings.service';
import { OrdersSummaryService } from '../orders/orders_summary.service';
import { FileService } from '../storage/file.service';

@Controller('products')
export class ProductsController {
  constructor(
    private productsService: ProductsService,
    private stripeService: StripeService,
    private shippoService: ShippoService,
    private storeSettingsService: StoreSettingsService,
    private ordersSummaryService: OrdersSummaryService,
    private fileService: FileService,
  ) {}

  @Get('all')
  getAll(@Query('take') take: number, @Query('skip') skip: number) {
    return this.productsService.getAll(take, skip);
  }

  @Get('for-category/:id')
  getForCategory(
    @Param('id') categoryId: number,
    @Query('take') take: number,
    @Query('skip') skip: number,
  ) {
    return this.productsService.getAllForCategory(categoryId, take, skip);
  }

  @Delete('product-file')
  async deleteProductFile(
    @Query('fileId') fileId: number,
    @Query('productId') productId: number,
  ) {
    return await this.productsService.deleteProductFile(productId, fileId);
  }

  @Get('images/:id')
  async getProductImages(@Param('id') productId) {
    const results: any[] = [];
    const productFiles = await this.productsService.getAllProductFiles(
      productId,
      'image',
    );
    for (let i = 0; i < productFiles.length; i++) {
      const file = await this.fileService.getFileById(productFiles[i].fileId);
      if (file) {
        results.push({
          ...productFiles[i],
          ...file,
        });
      }
    }
    return results;
  }

  @Post()
  @UseGuards(JwtGuard)
  async addProduct(
    @Body()
    body: any,
  ) {
    const product = await this.productsService.addProduct(body);
    if (product) {
      for (let i = 0; i < body.productImages.length; i++) {
        await this.productsService.saveProductFile(
          product.id,
          body.productImages[i].id,
          'image',
          i,
        );
      }
      return product;
    }
    return new InternalServerErrorException('Error creating product!');
  }

  @Put('publish/:id')
  @UseGuards(JwtGuard)
  async publishProduct(@Body() body, @Param('id') productId) {
    return this.productsService.publishProduct(productId, body.published);
  }

  @Get('get-shipping-rates')
  async getShippingRates(
    @Query('addressTo') addressTo: string,
    @Query('items') items: string,
  ) {
    let addressFromObj;
    const results = await this.storeSettingsService.getStoreSettings();
    if (results && results.length > 0) {
      const obj = results[0];
      addressFromObj = {
        name: obj.storeName,
        street1: obj.street1,
        city: obj.city,
        state: obj.state,
        zip: obj.zip,
        country: obj.country,
      };
    }
    const addressToObj = JSON.parse(addressTo);
    const parcels = await this.getParcels(items);
    return this.shippoService.getRates(addressFromObj, addressToObj, parcels);
  }

  async getParcels(items: string) {
    const parcels: ParcelCreateRequest[] = [];
    const itemsObj = JSON.parse(items);
    const ids = itemsObj.map((t) => t.id);
    const [products, numbers] = await this.productsService.getProducts(ids);
    products.forEach((p) => {
      parcels.push({
        length: p.length.toString(),
        width: p.width.toString(),
        height: p.height.toString(),
        weight: p.weight.toString(),
        massUnit: p.massUnit as WeightUnitEnum,
        distanceUnit: p.distanceUnit as DistanceUnitEnum,
      });
    });
    return parcels;
  }

  @Post('checkout')
  @UseGuards(JwtGuard)
  async Checkout(
    @CurrentUser() user: User,
    @Body('summaryId') summaryId,
    @Headers() headers,
  ) {
    const orderSummary =
      await this.ordersSummaryService.getOrderSummary(summaryId);
    if (orderSummary) {
      const rate = await this.shippoService.getRate(orderSummary.rateId);
      const itemsObj = JSON.parse(orderSummary.items);
      const results = await this.productsService.getProducts(
        itemsObj.map((t) => t.id),
      );
      if (results && results[0].length > 0) {
        const items = results[0].map((t) => ({
          id: t.id,
          name: t.title,
          price: t.price,
          imageUrl: t.imageUrl,
          quantity: itemsObj.find((tq) => tq.id === t.id)?.quantity ?? 1,
        }));
        return this.stripeService.checkout(
          user.id,
          items,
          summaryId,
          rate,
          headers,
        );
      } else throw new NotFoundException('Products not found!');
    } else throw new NotFoundException('Order Summary not Found!');
  }

  @Post('/filter')
  getFiltered(
    @Query('take') take: number,
    @Query('skip') skip: number,
    @Body() body,
  ) {
    return this.productsService.getFiltered(body.filter, take, skip);
  }

  @Get('/admin-published-products')
  async getAdminPublishedProducts(
    @Query('take') take: number,
    @Query('skip') skip: number,
  ) {
    const r = await this.productsService.getAllPublished(take, skip);
    return r;
  }

  @Get('/admin-not-published-products')
  async getAdminNotPublishedProducts(
    @Query('take') take: number,
    @Query('skip') skip: number,
  ) {
    const r = await this.productsService.getAllNotPublished(take, skip);
    return r;
  }

  @Get(':id')
  async getProduct(@Headers() headers, @Param('id') id: number) {
    return await this.productsService.getProduct(id);
  }

  @Put(':id')
  @UseGuards(JwtGuard)
  async updateProduct(
    @CurrentUser() user: User,
    @Param('id') id: number,
    @Body() body,
  ) {
    const { productImages, ...product } = body;
    if (user && user.isAdmin) {
      await this.productsService.deleteOldProductFiles(product.id);
      for (let i = 0; i < productImages.length; i++) {
        await this.productsService.addProductFile(
          product.id,
          productImages[i].id,
          'image',
          i,
        );
      }
      return this.productsService.updateProduct(id, product);
    }
    throw new UnauthorizedException(
      'You are not authorized to update the product',
    );
  }

  /* @Delete('/:id')
  @UseGuards(JwtGuard)
  deleteProduct(@CurrentUser() user: User, @Param('id') productId: number) {
    if (user && user.isAdmin) {
      return this.productsService.removeProduct(productId);
    }
    throw new UnauthorizedException(
      'You do not have a permission to delete the product',
    );
  } */
}
