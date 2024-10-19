import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class OrderSummary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  rateId: string;

  @Column()
  orderDate: Date;

  @Column()
  items: string;

  @Column()
  total: number;
}
