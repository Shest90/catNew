// src/rentals/rentals.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rental } from './rental.entity';
import { RentalsService } from './rentals.service';
import { RentalsController } from './rentals.controller';
import { Catamaran } from '../catamarans/catamaran.entity';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [TypeOrmModule.forFeature([Rental, Catamaran]), MailerModule],
  providers: [RentalsService],
  controllers: [RentalsController],
})
export class RentalsModule {}
