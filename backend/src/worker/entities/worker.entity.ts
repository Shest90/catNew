// src/workers/worker.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Admin } from '../../admin/entities/admin.entity';
import { Catamaran } from '../../catamarans/catamaran.entity';

@Entity()
export class Worker {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @ManyToOne(() => Admin, (admin) => admin.workers)
  admin: Admin;

  @OneToMany(() => Catamaran, (catamaran) => catamaran.worker)
  catamarans: Catamaran[];
}
