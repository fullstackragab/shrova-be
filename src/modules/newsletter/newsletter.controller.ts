import { Body, Controller, Post, Query } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';

@Controller('newsletter')
export class NewsletterController {
  constructor(private newsletterService: NewsletterService) {}

  @Post()
  addToNewsLetter(@Body() body) {
    const obj = {
      email: body.email,
      active: true,
    };
    return this.newsletterService.addToNewsLetter(obj);
  }

  @Post('unsubscribe')
  unsubscribe(@Query('email') email) {
    return this.newsletterService.unsubscribe(email);
  }
}
