// src/rentals/rental.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Comment } from '../comments/comment.entity';
import { Worker } from '../worker/entities/worker.entity';
import { Catamaran } from '../catamarans/catamaran.entity';

@Entity()
export class Rental {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Catamaran, { onDelete: 'CASCADE' })
  catamaran: Catamaran;

  @ManyToOne(() => Worker, { onDelete: 'SET NULL', nullable: true })
  worker?: Worker;

  @Column({ type: 'datetime' })
  startTime: Date;

  @Column({ type: 'datetime', nullable: true })
  endTime?: Date;

  /** Длительность чистого проката в минутах */
  @Column({ type: 'int', default: 0 })
  durationMinutes: number;

  @Column({ type: 'int', default: 1 })
  count: number;

  @OneToMany(() => Comment, (comment) => comment.rental, {
    cascade: true,
    eager: true,
  })
  comments: Comment[];

  @CreateDateColumn()
  createdAt: Date;
}
