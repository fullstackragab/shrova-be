import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ShippoService } from 'src/modules/shippo/shippo.service';
import { OrdersSummaryService } from './orders_summary.service';
import { ProductsService } from '../products/products.service';
import { JwtGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/modules/users/current-user.decorator';
import { User } from 'src/modules/users/user.entity';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private productsService: ProductsService,
    private shippoService: ShippoService,
    private ordersSummaryService: OrdersSummaryService,
  ) {}

  @Get('all')
  @UseGuards(JwtGuard)
  async getAllOrders(
    @CurrentUser() user: User,
    @Param('take') take,
    @Param('skip') skip,
  ) {
    const results = await this.ordersService.getAll(user.id, take, skip);
    const ordersObj = results[0].map((t) => ({
      ...t,
      items: JSON.parse(t.items),
    }));
    const ids = ordersObj.flatMap((t) => t.items).map((t) => t.id);
    const [products, numbers] = await this.productsService.getProducts(ids);
    const orders: any[] = [];
    ordersObj.forEach((order) => {
      const items: any[] = [];
      order.items.forEach((t) => {
        const fnd = products.find((p) => p.id === t.id);
        if (fnd)
          items.push({
            id: fnd.id,
            imageUrl: fnd.imageUrl,
            title: fnd.title,
            price: fnd.price,
            quantity: t.quantity,
          });
      });
      const newOrderObj = {
        id: order.id,
        userId: order.userId,
        transObjId: order.transObjId,
        paymentIntentId: order.paymentIntentId,
        summaryId: order.summaryId,
        orderDate: order.orderDate,
        items,
        total: order.total,
        labelUrl: order.labelUrl,
        trackingNumber: order.trackingNumber,
        trackingUrl: order.trackingUrl,
      };
      orders.push(newOrderObj);
    });

    return orders;
  }

  @Get('summary')
  @UseGuards(JwtGuard)
  async createSummary(
    @CurrentUser() user: User,
    @Query('items') itemsStr: string,
    @Query('rateId') rateId: string,
  ) {
    const itemsObj = JSON.parse(itemsStr);
    const ids = itemsObj.map((t) => t.id);
    const [products, numbers] = await this.productsService.getProducts(ids);
    let subtotal = 0;
    let count = 0;
    products.forEach((product) => {
      const p = itemsObj.find((t) => t.id === product.id);
      if (p) {
        subtotal = this.roundNumber(subtotal + product.price * p.quantity);
        count += p.quantity;
      }
    });
    const rate = await this.shippoService.getRate(rateId);
    const orderItems = products.map((t) => {
      let quantity = 0;
      const p = itemsObj.find((q) => q.id === t.id);
      if (p) {
        quantity = p.quantity;
      }
      return {
        title: t.title,
        price: t.price,
        quantity,
        imageUrl: t.imageUrl,
        subtotal: this.roundNumber(t.price * quantity),
      };
    });
    let summary = {
      items: orderItems,
      count,
      date: new Date(),
      subtotal,
      total: this.roundNumber(+rate.amount + subtotal),
      shipping: rate.amount,
      userId: user.id,
    };
    const cObj = await this.ordersSummaryService.create({
      items: itemsStr,
      orderDate: summary.date,
      total: summary.total,
      userId: user.id,
      rateId,
    });

    return { ...summary, id: cObj.id };
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  getOrder(@CurrentUser() user: User, @Param('id') orderId) {
    return this.ordersService.getOrderById(user.id, orderId);
  }

  roundNumber(v: number) {
    return Math.round((v + Number.EPSILON) * 100) / 100;
  }
}
