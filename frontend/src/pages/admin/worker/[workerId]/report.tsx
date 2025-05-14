// frontend/src/pages/admin/worker/[workerId]/report.tsx
import { useRouter } from "next/router";
import React, { useState, useEffect, FormEvent } from "react";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useGetWorkerReportQuery } from "../../../../features/reports/reportsApi";

export default function WorkerReportPage() {
  const router = useRouter();
  const { workerId } = router.query as { workerId?: string };

  const [workerName, setWorkerName] = useState<string>("");
  const [dates, setDates] = useState({ startDate: "", endDate: "" });
  const [filterNames, setFilterNames] = useState("");

  // 1) Подгружаем имя рабочего
  useEffect(() => {
    if (!workerId) return;
    const token = localStorage.getItem("token");
    fetch("http://localhost:3001/admin/workers", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Не удалось загрузить список рабочих");
        return res.json();
      })
      .then((workers: Array<{ id: number; username: string }>) => {
        const w = workers.find((w) => w.id === Number(workerId));
        if (w) setWorkerName(w.username);
      })
      .catch((e) => {
        console.error(e);
        setWorkerName("");
      });
  }, [workerId]);

  // 2) Формируем аргумент для отчёта
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

  const {
    data: report,
    isLoading,
    isError,
  } = useGetWorkerReportQuery(queryArg);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  if (!workerId) return <p>Нет workerId в URL</p>;

  return (
    <div className="container">
      <h1>Отчёт по работнику {workerName ? workerName : `#${workerId}`}</h1>

      <form onSubmit={handleSubmit} className="filter-form">
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
        </label>
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
        </label>
        <label>
          Фильтр (имена через запятую){" "}
          <input
            type="text"
            value={filterNames}
            onChange={(e) => setFilterNames(e.target.value)}
          />
        </label>
        <button type="submit">Сформировать</button>
      </form>

      {isLoading && <p className="info">Загрузка отчёта…</p>}
      {isError && <p className="info">Ошибка при загрузке отчёта.</p>}

      {report && (
        <>
          <h2>Итого прокатов: {report.totalRentals}</h2>
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
                {report.items.map((it, idx) => (
                  <tr key={idx}>
                    <td>{it.catamaranName}</td>
                    <td>{new Date(it.startAt).toLocaleString()}</td>
                    <td>{new Date(it.endAt).toLocaleString()}</td>
                    <td>{it.durationMinutes}</td>
                    <td>{it.count}</td>
                    <td>
                      {it.comments.length > 0 ? (
                        it.comments.map((txt, i) => (
                          <div key={i} className="comment">
                            — {txt}
                          </div>
                        ))
                      ) : (
                        <span className="empty">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <style jsx>{`
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
