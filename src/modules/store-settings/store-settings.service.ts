import { Injectable } from '@nestjs/common';
import { StoreSettings } from './store-settings.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
@Injectable()
export class StoreSettingsService {
  constructor(
    @InjectRepository(StoreSettings) private repo: Repository<StoreSettings>,
  ) {}

  async getStoreSettings() {
    return await this.repo.find();
  }

  async saveStoreSettings(storeSettings: DeepPartial<StoreSettings>) {
    const results = await this.repo.find();
    if (results && results.length > 0) {
      const obj = { id: results[0].id, ...storeSettings };
      return this.repo.save(obj);
    } else return this.repo.save(storeSettings);
  }
}
