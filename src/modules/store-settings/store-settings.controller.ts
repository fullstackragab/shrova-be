import { Body, Controller, Get, Post } from '@nestjs/common';
import { StoreSettingsService } from './store-settings.service';

@Controller('store-settings')
export class StoreSettingsController {
  constructor(private readonly storeSettingsService: StoreSettingsService) {}

  @Get()
  getStoreSettings() {
    return this.storeSettingsService.getStoreSettings();
  }

  @Post()
  saveStoreSettings(@Body() body: any) {
    return this.storeSettingsService.saveStoreSettings(body);
  }
}
