// frontend/src/pages/admin/worker/[workerId]/report.tsx
import { useRouter } from "next/router";
import React, { useState, useEffect, FormEvent, useMemo } from "react";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useGetWorkerReportQuery } from "../../../../features/reports/reportsApi";
import { useGetSettingsQuery } from "../../../../features/settings/settingsApi";

export default function WorkerReportPage() {
  const router = useRouter();
  const { workerId } = router.query as { workerId?: string };

  const [workerName, setWorkerName] = useState("");

  // Фильтры
  const [dates, setDates] = useState({ startDate: "", endDate: "" });
  const [filterNames, setFilterNames] = useState("");

  // Подтягиваем имя рабочего
  useEffect(() => {
    if (!workerId) return;
    const token = localStorage.getItem("token");
    fetch("http://localhost:3001/admin/workers", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((workers: Array<{ id: number; username: string }>) => {
        const w = workers.find((w) => w.id === Number(workerId));
        if (w) setWorkerName(w.username);
      })
      .catch(() => setWorkerName(""));
  }, [workerId]);

  // Глобальные лимиты
  const {
    data: settings,
    isLoading: loadingSettings,
    isError: errorSettings,
  } = useGetSettingsQuery();

  // Аргумент для отчёта
  const queryArg =
    workerId && !Array.isArray(workerId) && dates.startDate && dates.endDate
      ? {
          workerId: Number(workerId),
          startDate: dates.startDate,
          endDate: dates.endDate,
        }
      : skipToken;

  const {
    data: report,
    isLoading: loadingReport,
    isError: errorReport,
  } = useGetWorkerReportQuery(queryArg);

  // Фильтрация катамаранов
  const filteredItems = useMemo(() => {
    if (!report) return [];

    return report.items.filter((item) => {
      if (!filterNames) return true;

      const filters = filterNames
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter((s) => s);

      return filters.some((filter) =>
        item.catamaranName.toLowerCase().startsWith(filter)
      );
    });
  }, [report, filterNames]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  if (!workerId) return <p>Нет workerId в URL</p>;
  if (loadingSettings || !settings)
    return <p className="info">Загрузка лимитов…</p>;
  if (errorSettings)
    return <p className="info">Не удалось загрузить лимиты.</p>;

  return (
    <div className="container">
      <h1>Отчёт по работнику {workerName || `#${workerId}`}</h1>

      <form onSubmit={handleSubmit} className="filter-form">
        <label>
          С
          <input
            type="date"
            value={dates.startDate}
            onChange={(e) =>
              setDates((d) => ({ ...d, startDate: e.target.value }))
            }
            required
          />
        </label>
        <label>
          По
          <input
            type="date"
            value={dates.endDate}
            onChange={(e) =>
              setDates((d) => ({ ...d, endDate: e.target.value }))
            }
            required
          />
        </label>
        <label>
          Фильтр (первые буквы через запятую)
          <input
            type="text"
            value={filterNames}
            onChange={(e) => setFilterNames(e.target.value)}
            placeholder="эл,жук,рол"
          />
        </label>
        <button type="submit">Сформировать</button>
      </form>

      {loadingReport && <p className="info">Загрузка отчёта…</p>}
      {errorReport && <p className="info">Ошибка при загрузке отчёта.</p>}

      {report && (
        <>
          <h2>
            Итого прокатов:{" "}
            {filteredItems.reduce((sum, it) => sum + it.count, 0)}
          </h2>
          <div className="table-wrapper">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Катамаран</th>
                  <th>Начало</th>
                  <th>Окончание</th>
                  <th>Длительность (мин)</th>
                  <th>Число прокатов</th>
                  <th>Комментарии</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((it, idx) => {
                  const dayUtc = new Date(it.startAt).getUTCDay();
                  const globalBase =
                    dayUtc === 0 || dayUtc === 6
                      ? settings.weekendLimit
                      : settings.weekdayLimit;
                  const baseLimit = it.timerLimitMinutes ?? globalBase;
                  const threshold = baseLimit * it.count;
                  const over = it.durationMinutes > threshold;

                  return (
                    <tr key={idx}>
                      <td style={{ fontSize: "1.3rem", fontWeight: "500" }}>
                        {it.catamaranName}
                      </td>
                      <td>{new Date(it.startAt).toLocaleString()}</td>
                      <td>{new Date(it.endAt).toLocaleString()}</td>
                      <td
                        style={{
                          color: over ? "red" : "green",
                          fontWeight: over ? "bold" : "normal",
                        }}
                      >
                        {it.durationMinutes}
                      </td>
                      <td>{it.count}</td>
                      <td>
                        {it.comments.length > 0 ? (
                          it.comments.map((txt, i) => (
                            <div key={i} className="comment">
                              {txt}
                            </div>
                          ))
                        ) : (
                          <span className="empty">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <style jsx>{`
        .group-header {
          background-color: #f5f5f5;
          font-weight: bold;
        }

        .nested-table {
          width: 100%;
          margin-top: 0.5rem;
          border-collapse: collapse;
        }

        .nested-table th,
        .nested-table td {
          border: 1px solid #ddd;
          padding: 0.5rem;
          font-size: 0.9rem;
        }

        details summary {
          cursor: pointer;
          color: #0066cc;
          font-weight: normal;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 1rem;
        }
        h1,
        h2 {
          text-align: center;
        }
        .filter-form {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem 1rem;
          justify-content: center;
          margin-bottom: 1.5rem;
        }
        .filter-form label {
          display: flex;
          flex-direction: column;
          font-size: 0.95rem;
        }
        .filter-form input {
          margin-top: 0.25rem;
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .filter-form button {
          align-self: end;
          padding: 0.5rem 1rem;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .info {
          text-align: center;
          padding: 2rem;
        }
        .table-wrapper {
          overflow-x: auto;
        }
        .report-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
        }
        th,
        td {
          border: 1px solid #ccc;
          padding: 0.75rem;
          text-align: left;
        }
        .comment {
          color: #0066cc;
          font-size: 0.85rem;
        }
        .empty {
          color: #888;
        }
        @media (max-width: 1024px) {
          th,
          td {
            padding: 0.5rem;
            font-size: 0.9rem;
          }
          .filter-form input {
            padding: 0.4rem;
            font-size: 0.9rem;
          }
          .filter-form button {
            padding: 0.4rem 0.8rem;
            font-size: 0.9rem;
          }
        }
        @media (max-width: 600px) {
          .container {
            padding: 0.5rem;
          }
          .filter-form {
            flex-direction: column;
          }
          th,
          td {
            padding: 0.4rem;
            font-size: 0.8rem;
          }
          .filter-form button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
