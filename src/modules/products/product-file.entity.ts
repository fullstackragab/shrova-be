import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ProductFile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @Column()
  fileId: number;

  @Column()
  type: string;

  @Column()
  order: number;
}
