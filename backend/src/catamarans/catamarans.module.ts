import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Catamaran } from './catamaran.entity';
import { CatamaransService } from './catamarans.service';
import { CatamaransController } from './catamarans.controller';
import { Worker } from '../worker/entities/worker.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Catamaran, Worker])],
  controllers: [CatamaransController],
  providers: [CatamaransService],
  exports: [CatamaransService],
})
export class CatamaransModule {}
