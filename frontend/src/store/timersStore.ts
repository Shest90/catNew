// frontend/src/store/timersStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import localforage from "localforage";

export interface TimerState {
  elapsed: number; // накопленные секунды
  lastStart: number | null; // timestamp старта
}

export interface TimersState {
  timers: Record<string, TimerState>;
  startTimer: (id: string) => void;
  pauseTimer: (id: string) => void;
  resetTimer: (id: string) => void;
}

export const useTimersStore = create<TimersState>()(
  persist(
    (set, get) => ({
      timers: {},
      startTimer: (id) => {
        const t = get().timers[id] || { elapsed: 0, lastStart: null };
        if (t.lastStart) return;
        set((s) => ({
          timers: {
            ...s.timers,
            [id]: { elapsed: t.elapsed, lastStart: Date.now() },
          },
        }));
      },
      pauseTimer: (id) => {
        const t = get().timers[id];
        if (!t?.lastStart) return;
        const added = Math.floor((Date.now() - t.lastStart) / 1000);
        set((s) => ({
          timers: {
            ...s.timers,
            [id]: { elapsed: t.elapsed + added, lastStart: null },
          },
        }));
      },
      resetTimer: (id) => {
        set((s) => ({
          timers: {
            ...s.timers,
            [id]: { elapsed: 0, lastStart: null },
          },
        }));
      },
    }),
    {
      name: "timers-storage", // ключ в IndexedDB
      storage: createJSONStorage(() => localforage),
    }
  )
);
