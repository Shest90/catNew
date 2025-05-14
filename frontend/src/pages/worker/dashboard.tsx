// frontend/src/pages/worker/dashboard.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useGetSettingsQuery } from "../../features/settings/settingsApi";
import { useGetCatamaransForWorkerQuery } from "../../features/catamarans/catamaransApi";
import Timer from "../../components/Timer";

type Mode = "weekday" | "weekend";

export default function WorkerDashboard() {
  const router = useRouter();

  // 1) Редирект, если не авторизован
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/auth");
    }
  }, [router]);

  // 2) Загружаем настройки и катамараны
  const { data: settings, isLoading: loadingSettings } = useGetSettingsQuery();
  const { data: catamarans = [], isLoading: loadingCats } =
    useGetCatamaransForWorkerQuery();

  // 3) Режим будни/выходные с сохранением в localStorage
  const defaultMode = (): Mode => {
    const day = new Date().getDay();
    return day === 0 || day === 6 ? "weekend" : "weekday";
  };
  const [mode, setMode] = useState<Mode>(() => {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem("mode") : null;
    if (stored === "weekday" || stored === "weekend") return stored;
    return defaultMode();
  });
  useEffect(() => {
    localStorage.setItem("mode", mode);
  }, [mode]);

  // 4) Состояние счётчиков (множителей)
  const [counts, setCounts] = useState<Record<number, number>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem("catCounts") || "{}");
    } catch {
      return {};
    }
  });
  useEffect(() => {
    if (catamarans.length > 0) {
      setCounts((prev) => {
        const next = { ...prev };
        catamarans.forEach((c) => {
          if (!next[c.id]) next[c.id] = 1;
        });
        return next;
      });
    }
  }, [catamarans]);
  useEffect(() => {
    localStorage.setItem("catCounts", JSON.stringify(counts));
  }, [counts]);

  const changeCount = (id: number, delta: number) => {
    setCounts((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta),
    }));
  };
  const resetCount = (id: number) => {
    setCounts((prev) => ({ ...prev, [id]: 1 }));
  };

  // 5) Ждём загрузки
  if (loadingSettings || loadingCats || !settings) {
    return <p>Загрузка…</p>;
  }

  return (
    <div className="page">
      {/* Переключатель режима */}
      <div className="mode-switch">
        <button
          onClick={() => setMode("weekday")}
          className={mode === "weekday" ? "active" : ""}
        >
          Будни: {settings.weekdayLimit} мин
        </button>
        <button
          onClick={() => setMode("weekend")}
          className={mode === "weekend" ? "active" : ""}
        >
          Выходные: {settings.weekendLimit} мин
        </button>
      </div>

      <ul className="cat-list">
        {catamarans.map((c) => {
          const base =
            c.timerLimitMinutes != null
              ? c.timerLimitMinutes
              : mode === "weekday"
              ? settings.weekdayLimit
              : settings.weekendLimit;
          const count = counts[c.id] || 1;
          const totalLimit = base * count;

          return (
            <li key={c.id} className="cat-card">
              <h2 className="cat-name">{c.name}</h2>
              <div className="multiplier">
                <button
                  onClick={() => changeCount(c.id, -1)}
                  disabled={count <= 1}
                >
                  −
                </button>
                <span>{count}</span>
                <button onClick={() => changeCount(c.id, +1)}>+</button>
                <span className="limit">лимит: {totalLimit} мин</span>
              </div>
              <Timer
                id={`cat_${c.id}`}
                catamaranId={c.id}
                limitMinutes={totalLimit}
                count={count}
                onReset={() => resetCount(c.id)}
              />
            </li>
          );
        })}
      </ul>

      <style jsx>{`
        .page {
          padding: 1rem;
        }
        .mode-switch {
          position: sticky;
          top: 0;
          background: #fff;
          padding: 0.5rem 0;
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          z-index: 10;
        }
        .mode-switch button {
          padding: 0.4rem 0.8rem;
          border: none;
          border-radius: 4px;
          background: #eee;
          cursor: pointer;
          font-size: 0.85rem;
        }
        .mode-switch button.active {
          background: #0070f3;
          color: #fff;
        }
        .cat-list {
          display: grid;
          gap: 0.5rem;
          grid-template-columns: repeat(3, 1fr);
        }
        .cat-card {
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-size: 0.9rem;
        }
        .cat-name {
          margin: 0;
          font-size: 1rem;
          text-align: center;
        }
        .multiplier {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          flex-wrap: wrap;
        }
        .multiplier button {
          width: 1.5rem;
          height: 1.5rem;
          border: none;
          border-radius: 4px;
          background: #0070f3;
          color: #fff;
          font-size: 1rem;
          line-height: 1;
          cursor: pointer;
        }
        .multiplier span {
          font-size: 0.9rem;
        }
        .limit {
          margin-left: auto;
          color: #555;
          font-size: 0.85rem;
        }

        /* Планшеты (ширина ≤ 1024px) — 3 карточки */
        @media (max-width: 1024px) {
          .cat-list {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        /* Телефоны (ширина ≤ 600px) — 2 карточки */
        @media (max-width: 600px) {
          .cat-list {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        /* Очень узкие экраны (ширина ≤ 400px) — 1 карточка */
        @media (max-width: 400px) {
          .cat-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
