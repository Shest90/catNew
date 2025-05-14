// src/settings/setting.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Admin } from '../admin/entities/admin.entity';

@Entity()
export class Setting {
  @PrimaryGeneratedColumn()
  id: number;

  // Убираем default и делаем nullable
  @Column({ type: 'int', nullable: true })
  weekdayLimit: number | null;

  @Column({ type: 'int', nullable: true })
  weekendLimit: number | null;

  // связь «многие-на-один» к админу
  @ManyToOne(() => Admin, (admin) => admin.settings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'adminId' })
  admin: Admin;

  @Column()
  adminId: number;

  @CreateDateColumn()
  createdAt: Date;
}
