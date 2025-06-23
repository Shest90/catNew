// src/rentals/rentals.controller.ts
import {
  Controller,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RentalsService } from './rentals.service';
import { CreateRentalDto } from './dto/create-rental.dto';
import { FinishRentalDto } from './dto/finish-rental.dto';

@UseGuards(JwtAuthGuard)
@Controller('worker/catamarans/:catamaranId/rentals')
export class RentalsController {
  constructor(private readonly svc: RentalsService) {}

  // Старт проката
  @Post()
  start(
    @Param('catamaranId') catamaranId: string,
    @Body() dto: CreateRentalDto & { timeZone?: string },
    @Req() req,
  ) {
    console.log('Контроллер получил timeZone:', dto.timeZone);
    const workerId = req.user.id as number;
    // Передаём все три аргумента явно
    return this.svc.startRental(
      +catamaranId,
      workerId,
      dto.count, // может быть undefined → сервис подпоставит 1
      dto.timeZone,
    );
  }

  // Завершение проката
  @Patch(':rentalId')
  finish(@Param('rentalId') rentalId: string, @Body() dto: FinishRentalDto) {
    return this.svc.finishRental(+rentalId, dto);
  }
}
