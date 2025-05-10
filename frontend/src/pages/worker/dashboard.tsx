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

  // 4) Состояние счётчиков (множителей) для каждого катамарана
  const [counts, setCounts] = useState<Record<number, number>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem("catCounts") || "{}");
    } catch {
      return {};
    }
  });
  // Инициализируем недостающие счётчики единицей
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
  // Сохраняем в localStorage при изменении
  useEffect(() => {
    localStorage.setItem("catCounts", JSON.stringify(counts));
  }, [counts]);

  // Ф-ции для изменения и сброса счётчика
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
    <div style={{ position: "relative", padding: "1rem" }}>
      {/* Переключатель режима и показ лимитов */}
      <div style={{ position: "absolute", top: 16, right: 16 }}>
        <button
          onClick={() => setMode("weekday")}
          style={{
            marginRight: 8,
            background: mode === "weekday" ? "#0070f3" : "#eee",
            color: mode === "weekday" ? "#fff" : "#333",
          }}
        >
          Будни: {settings.weekdayLimit} мин
        </button>
        <button
          onClick={() => setMode("weekend")}
          style={{
            background: mode === "weekend" ? "#0070f3" : "#eee",
            color: mode === "weekend" ? "#fff" : "#333",
          }}
        >
          Выходные: {settings.weekendLimit} мин
        </button>
      </div>

      <h1>Мои катамараны</h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {catamarans.map((c) => {
          // 6) Вычисляем базовый лимит и итоговый
          const base =
            c.timerLimitMinutes != null
              ? c.timerLimitMinutes
              : mode === "weekday"
              ? settings.weekdayLimit
              : settings.weekendLimit;

          const count = counts[c.id] || 1;
          const totalLimit = base * count; // ← Тут объявляем totalLimit

          return (
            <li
              key={c.id}
              style={{
                marginBottom: "1.5rem",
                padding: "1rem",
                border: "1px solid #ccc",
                borderRadius: 4,
              }}
            >
              <h2 style={{ margin: 0 }}>{c.name}</h2>

              {/* Контроллы множителя */}
              <div
                style={{
                  margin: "0.5rem 0",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <button
                  onClick={() => changeCount(c.id, -1)}
                  disabled={count <= 1}
                >
                  −
                </button>
                <span style={{ margin: "0 0.75rem" }}>{count}</span>
                <button onClick={() => changeCount(c.id, +1)}>+</button>
                <span style={{ marginLeft: "1rem", color: "#555" }}>
                  лимит: {totalLimit} мин
                </span>
              </div>

              {/* Таймер */}
              <Timer
                id={`cat_${c.id}`}
                catamaranId={c.id}
                limitMinutes={totalLimit}
                count={count} // ← Передаём count
                onReset={() => resetCount(c.id)} // ← Передаём resetCount
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
