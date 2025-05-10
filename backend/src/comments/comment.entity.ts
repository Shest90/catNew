// src/comments/comment.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Catamaran } from '../catamarans/catamaran.entity';
import { Rental } from '../rentals/rental.entity';
import { Worker } from '../worker/entities/worker.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  text: string;

  @CreateDateColumn()
  createdAt: Date;

  // Обязательное поле catamaranId + relation

  @Column({ name: 'catamaranId' })
  catamaranId: number;

  @ManyToOne(() => Catamaran, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'catamaranId' })
  catamaran: Catamaran;

  // Сделаем rental необязательным

  @Column({ name: 'rentalId', nullable: true })
  rentalId?: number;

  @ManyToOne(() => Rental, (r) => r.comments, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'rentalId' })
  rental?: Rental;

  //
  // Поле workerId тоже явно
  //
  @Column({ name: 'workerId', nullable: true })
  workerId?: number;

  @ManyToOne(() => Worker, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'workerId' })
  worker?: Worker;
}
