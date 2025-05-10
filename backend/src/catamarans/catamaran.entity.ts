import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Worker } from '../worker/entities/worker.entity';
import { Rental } from '../rentals/rental.entity';

@Entity()
export class Catamaran {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'int', nullable: true })
  timerLimitMinutes?: number;

  @Column({ default: false })
  notifyOnStart: boolean;

  @OneToMany(() => Rental, (r) => r.catamaran)
  rentals: Rental[];

  @ManyToOne(() => Worker, (worker) => worker.catamarans, {
    onDelete: 'CASCADE',
  })
  worker: Worker;
}
