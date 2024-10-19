import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PaymentIntent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  paymentIntentId: string;

  @Column({ nullable: false })
  userId: number;

  @Column({ nullable: false })
  summaryId!: number;
}
