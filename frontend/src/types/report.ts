// frontend/src/types/report.ts
export interface ReportItem {
  catamaranName: string;
  startAt: string;
  endAt: string;
  durationMinutes: number;
  count: number;
  comments: string[];
}

export interface ReportResponse {
  items: ReportItem[];
  totalRentals: number;
}
