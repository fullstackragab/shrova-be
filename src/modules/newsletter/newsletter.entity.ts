import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Newsletter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  active: boolean;
}
