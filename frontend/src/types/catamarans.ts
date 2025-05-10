// frontend/src/types/catamarans.ts
export interface Catamaran {
  id: number;
  name: string;
  timerLimitMinutes?: number | null;
  notifyOnStart: boolean;
}
