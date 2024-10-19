import { Module } from '@nestjs/common';
import { ShippoService } from './shippo.service';

@Module({
  providers: [ShippoService],
  exports: [ShippoService],
})
export class ShippoModule {}
