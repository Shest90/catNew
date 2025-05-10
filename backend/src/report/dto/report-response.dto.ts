// src/report/dto/report-response.dto.ts

// экпортируем Item
export class ReportItemDto {
  catamaranName: string;
  startAt: Date;
  endAt: Date;
  durationMinutes: number;
  count: number;
  comments: string[];
}

// и сам ответ
export class ReportResponseDto {
  items: ReportItemDto[];
  totalRentals: number;
}
