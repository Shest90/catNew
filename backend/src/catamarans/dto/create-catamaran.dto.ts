import { IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCatamaranDto {
  @IsString()
  name: string;

  @IsOptional()
  @Type(() => Number) // превратить строку из body в число
  @IsInt()
  @Min(0)
  timerLimitMinutes?: number;

  @IsOptional()
  @IsBoolean()
  notifyOnStart?: boolean;
}
