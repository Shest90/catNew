// backend/src/rentals/dto/finish-rental.dto.ts
import { IsDateString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class FinishRentalDto {
  @IsInt()
  @Type(() => Number)
  durationMinutes: number;

  // передаём сюда текущее значение count
  @IsInt()
  @Type(() => Number)
  count: number;
}
