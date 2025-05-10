// src/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Admin } from './entities/admin.entity';
import { Worker } from '../worker/entities/worker.entity';
import { SettingsModule } from '../settings/settings.module'; // ← импортируем SettingsModule

@Module({
  imports: [
    // Подключаем репозитории Admin и Worker
    TypeOrmModule.forFeature([Admin, Worker]),
    // Импортируем SettingsModule, чтобы можно было инжектить SettingsService
    SettingsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
