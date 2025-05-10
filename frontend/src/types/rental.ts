// frontend/src/types/rental.ts
export interface Rental {
  id: number;
  catamaranId: number;
  workerId?: number;
  startTime: string; // ISO‑строка
  endTime?: string | null; // ISO‑строка или null, если не закончено
  durationMinutes: number; // итоговое время проката без пауз
  createdAt: string;
}
