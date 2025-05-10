// backend/src/report/report.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rental } from '../rentals/rental.entity';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Rental])],
  providers: [ReportService],
  controllers: [ReportController],
})
export class ReportModule {}
