// backend/src/report/dto/report-filter.dto.ts
import { IsOptional, IsString, IsDateString, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class ReportFilterDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      // если строка пустая, возвращаем пустой массив
      return value.trim() ? value.split(',').map((s) => s.trim()) : [];
    }
    return [];
  })
  @IsArray()
  @IsString({ each: true })
  catamarans?: string[];
}
