import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  transObjId: string;

  @Column()
  paymentIntentId: string;

  @Column()
  summaryId: number;

  @Column()
  orderDate: Date;

  @Column()
  items: string;

  @Column()
  total: number;

  @Column()
  labelUrl: string;

  @Column()
  trackingNumber: string;

  @Column()
  trackingUrl: string;
}
