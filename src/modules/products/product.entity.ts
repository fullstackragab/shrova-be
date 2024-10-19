import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  category: number;

  @Column()
  imageUrl: string;

  @Column()
  published: boolean;

  @Column()
  price: number;

  @Column()
  stock: number;

  @Column()
  length: number;

  @Column()
  width: number;

  @Column()
  height: number;

  @Column()
  distanceUnit: string;

  @Column()
  weight: number;

  @Column()
  massUnit: string;
}
