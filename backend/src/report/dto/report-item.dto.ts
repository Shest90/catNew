// backend/src/report/dto/report-item.dto.ts
export class ReportItemDto {
  catamaranName: string;
  startAt: Date;
  endAt: Date;
  durationMinutes: number;
  count: number;
  comments: string[];
  // ← добавили поле индивидуального лимита
  timerLimitMinutes?: number | null;
}
