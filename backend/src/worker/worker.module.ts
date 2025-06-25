// src/worker/worker.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Worker } from './entities/worker.entity';
import { Catamaran } from '../catamarans/catamaran.entity';
import { WorkerService } from './worker.service';
import { WorkerController } from './worker.controller';
import { WorkerSettingsController } from './worker-settings.controller';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [TypeOrmModule.forFeature([Worker, Catamaran]), SettingsModule],
  controllers: [WorkerController, WorkerSettingsController],
  providers: [WorkerService],
  exports: [WorkerService],
})
export class WorkerModule {}
