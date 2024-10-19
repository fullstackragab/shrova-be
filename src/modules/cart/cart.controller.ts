import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { CurrentUser } from '../users/current-user.decorator';
import { JwtGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @UseGuards(JwtGuard)
  saveCart(@CurrentUser() user, @Body() body) {
    return this.cartService.save(user.id, body.cart);
  }

  @Get()
  @UseGuards(JwtGuard)
  getCart(@CurrentUser() user) {
    return this.cartService.get(user.id);
  }
}
