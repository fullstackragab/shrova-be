import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DefaultAddress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  addressId: number;

  @Column()
  addressType: number;
}
