// src/admins/admin.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Worker } from '../../worker/entities/worker.entity';
import { Setting } from 'src/settings/setting.entity';

@Entity()
export class Admin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  // Храните пароль в зашифрованном виде (например, с использованием bcrypt)
  @Column()
  password: string;

  @OneToMany(() => Worker, (worker) => worker.admin)
  workers: Worker[];

  @OneToMany(() => Setting, (s) => s.admin, { cascade: true })
  settings: Setting[];
}
