import { Injectable } from '@nestjs/common';
import { Shippo } from 'shippo';
import {
  AddressCreateRequest,
  LabelFileTypeEnum,
  ParcelCreateRequest,
} from 'shippo/models/components';

const shippo = new Shippo({
  apiKeyHeader: `${process.env.SHIPPO_TOKEN}`,
});

@Injectable()
export class ShippoService {
  async getRates(
    addressFrom: AddressCreateRequest,
    addressTo: AddressCreateRequest,
    parcels: ParcelCreateRequest[],
  ) {
    const shipment = await shippo.shipments.create({
      addressFrom,
      addressTo,
      parcels,
      async: false,
    });
    return shipment;
  }

  async getRate(rateId: string) {
    return await shippo.rates.get(rateId);
  }

  async createTransaction(rate: string) {
    const transaction = await shippo.transactions.create({
      rate,
      labelFileType: LabelFileTypeEnum.Pdf,
      async: false,
    });
    return transaction;
  }
}
