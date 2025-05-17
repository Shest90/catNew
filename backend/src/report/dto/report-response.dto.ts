// backend/src/report/dto/report-response.dto.ts
import { ReportItemDto } from './report-item.dto';

export class ReportResponseDto {
  items: ReportItemDto[];
  totalRentals: number;
}
