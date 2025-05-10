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

  @Column({ type: 'int', default: 0 })
  weekdayLimit: number;

  @Column({ type: 'int', default: 0 })
  weekendLimit: number;

  // связь «многие-на-один» к админу
  @ManyToOne(() => Admin, (admin) => admin.settings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'adminId' })
  admin: Admin;

  @Column()
  adminId: number;

  @CreateDateColumn()
  createdAt: Date;
}
