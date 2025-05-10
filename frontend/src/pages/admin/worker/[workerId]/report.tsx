// frontend/src/pages/admin/worker/[workerId]/report.tsx
import { useRouter } from "next/router";
import React, { useState, FormEvent } from "react";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useGetWorkerReportQuery } from "../../../../features/reports/reportsApi";

export default function WorkerReportPage() {
  const router = useRouter();
  const { workerId } = router.query as { workerId?: string };

  const [dates, setDates] = useState({
    startDate: "",
    endDate: "",
  });
  const [filterNames, setFilterNames] = useState("");

  // Готовим аргумент для RTK Query — либо параметры, либо skipToken
  const queryArg =
    workerId && !Array.isArray(workerId) && dates.startDate && dates.endDate
      ? {
          workerId: Number(workerId),
          startDate: dates.startDate,
          endDate: dates.endDate,
          catamarans: filterNames
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0),
        }
      : skipToken;

  // Выполняем запрос
  const {
    data: report,
    isLoading,
    isError,
  } = useGetWorkerReportQuery(queryArg);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // ничего не делаем — RTK Query автоматически перезапустит запрос
  };

  if (!workerId) return <p>Нет workerId в URL</p>;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 16 }}>
      <h1>Отчёт по работнику #{workerId}</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <label>
          С{" "}
          <input
            type="date"
            value={dates.startDate}
            onChange={(e) =>
              setDates((d) => ({ ...d, startDate: e.target.value }))
            }
            required
          />
        </label>{" "}
        <label>
          По{" "}
          <input
            type="date"
            value={dates.endDate}
            onChange={(e) =>
              setDates((d) => ({ ...d, endDate: e.target.value }))
            }
            required
          />
        </label>{" "}
        <label>
          Фильтр по именам (через запятую){" "}
          <input
            type="text"
            value={filterNames}
            onChange={(e) => setFilterNames(e.target.value)}
          />
        </label>{" "}
        <button type="submit">Сформировать</button>
      </form>

      {isLoading && <p>Загрузка отчёта…</p>}
      {isError && <p>Ошибка при загрузке отчёта.</p>}

      {report && (
        <>
          <h2>Итого прокатов: {report.totalRentals}</h2>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: 16,
            }}
          >
            <thead>
              <tr>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>
                  Катамаран
                </th>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>Начало</th>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>
                  Окончание
                </th>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>
                  Длительность (мин)
                </th>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>
                  Число прокатов
                </th>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>
                  Комментарии
                </th>
              </tr>
            </thead>
            <tbody>
              {report.items.map((it, idx) => (
                <tr key={idx}>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>
                    {it.catamaranName}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>
                    {new Date(it.startAt).toLocaleString()}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>
                    {new Date(it.endAt).toLocaleString()}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>
                    {it.durationMinutes}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>
                    {it.count}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>
                    {it.comments && it.comments.length > 0 ? (
                      it.comments.map((txt, i) => (
                        <div key={i} style={{ fontSize: "0.85rem" }}>
                          — {txt}
                        </div>
                      ))
                    ) : (
                      <span style={{ color: "#888" }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
