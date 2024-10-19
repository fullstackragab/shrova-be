import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class StoreSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  storeName: string;

  @Column()
  street1: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  zip: string;

  @Column()
  country: string;
}
