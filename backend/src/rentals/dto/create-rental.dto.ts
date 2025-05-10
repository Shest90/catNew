// backend/src/rentals/dto/create-rental.dto.ts
import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRentalDto {
  /** только счётчик, всё остальное идёт из урла и из JWT */
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  count?: number;
}
