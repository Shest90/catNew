import { useRouter } from "next/router";
import React, { useState, useEffect, FormEvent, useMemo } from "react";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useGetWorkerReportQuery } from "../../../../features/reports/reportsApi";
import { useGetSettingsQuery } from "../../../../features/settings/settingsApi";

export default function WorkerReportPage() {
  const router = useRouter();
  const { workerId } = router.query as { workerId?: string };

  const [workerName, setWorkerName] = useState("");

  const [dates, setDates] = useState({ startDate: "", endDate: "" });
  const [filterNames, setFilterNames] = useState("");

  useEffect(() => {
    if (!workerId) return;
    const token = localStorage.getItem("token");
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/workers`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((workers: Array<{ id: number; username: string }>) => {
        const w = workers.find((w) => w.id === Number(workerId));
        if (w) setWorkerName(w.username);
      })
      .catch(() => setWorkerName(""));
  }, [workerId]);

  const {
    data: settings,
    isLoading: loadingSettings,
    isError: errorSettings,
  } = useGetSettingsQuery();

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

  const filteredItems = useMemo(() => {
    if (!report) return [];
    const filters = filterNames
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    return report.items.filter((item) =>
      filters.length === 0
        ? true
        : filters.some((filter) =>
            item.catamaranName.toLowerCase().startsWith(filter)
          )
    );
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
      <h1 className="title">
        Отчёт по работнику {workerName || `#${workerId}`}
      </h1>

      <form onSubmit={handleSubmit} className="filter-form">
        <input
          type="date"
          value={dates.startDate}
          onChange={(e) =>
            setDates((d) => ({ ...d, startDate: e.target.value }))
          }
          required
        />
        <input
          type="date"
          value={dates.endDate}
          onChange={(e) => setDates((d) => ({ ...d, endDate: e.target.value }))}
          required
        />
        <input
          type="text"
          value={filterNames}
          onChange={(e) => setFilterNames(e.target.value)}
          placeholder="Фильтр: эл,жук,рол"
        />
        <button type="submit">Сформировать</button>
      </form>

      {loadingReport && <p className="info">Загрузка отчёта…</p>}
      {errorReport && <p className="info">Ошибка при загрузке отчёта.</p>}

      {report && (
        <div>
          <h2 className="title">
            Итого прокатов:{" "}
            {filteredItems.reduce((sum, it) => sum + it.count, 0)}
          </h2>

          {filteredItems.length === 0 ? (
            <p className="info">Нет данных для отображения</p>
          ) : (
            <ul>
              {Object.entries(
                filteredItems.reduce((acc, rental) => {
                  if (!acc[rental.catamaranName])
                    acc[rental.catamaranName] = [];
                  acc[rental.catamaranName].push(rental);
                  return acc;
                }, {} as Record<string, typeof filteredItems>)
              ).map(([catamaranName, rentals], index) => {
                const totalCount = rentals.reduce((sum, r) => sum + r.count, 0);
                const totalDuration = rentals.reduce(
                  (sum, r) => sum + r.durationMinutes,
                  0
                );

                return (
                  <li key={index} className="rental-card">
                    <h3>
                      <strong>{catamaranName}</strong> — Дата проката:
                      {new Date(rentals[0].startAt).toLocaleDateString()}
                    </h3>
                    <div>Всего прокатов: {totalCount}</div>
                    <div>
                      Общая продолжительность:
                      <span className="duration-green">
                        {" "}
                        {totalDuration} мин.
                      </span>
                    </div>

                    {rentals.map((rental, i) => {
                      const dayUtc = new Date(rental.startAt).getUTCDay();
                      const globalBase =
                        dayUtc === 0 || dayUtc === 6
                          ? settings.weekendLimit
                          : settings.weekdayLimit;
                      const baseLimit = rental.timerLimitMinutes ?? globalBase;
                      const threshold = baseLimit * rental.count;
                      const over = rental.durationMinutes > threshold;

                      return (
                        <div key={i} className="rental-entry">
                          <div>
                            Начало:
                            <span className="startTime">
                              {new Date(rental.startAt).toLocaleTimeString()}
                            </span>
                            , Окончание:
                            {rental.endAt
                              ? new Date(rental.endAt).toLocaleTimeString()
                              : "Прокат не завершён"}
                            , Продолжительность:
                            <span
                              className={
                                over ? "duration-red" : "duration-green"
                              }
                            >
                              {` ${rental.durationMinutes} мин.`}
                            </span>
                          </div>

                          {rental.comments.length > 0 && (
                            <div className="returnComment">
                              Возврат: {rental.comments.join(", ")}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 1rem;
          border: 2px solid #005999;
          border-radius: 1rem;
          background-color: #f4faff;
          box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
          font-family: Arial, sans-serif;
        }

        .title {
          font-size: 1.6rem;
          color: #004080;
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .filter-form {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .filter-form input {
          width: 100%;
          max-width: 250px;
          padding: 0.75rem;
          font-size: 1rem;
          border: 2px solid #005999;
          border-radius: 0.75rem;
          background-color: white;
        }

        .filter-form button {
          padding: 0.75rem 1.5rem;
          background-color: #28a745;
          color: white;
          border: none;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .filter-form button:hover {
          background-color: #218838;
        }

        .info {
          color: #007bff;
          text-align: center;
          padding: 1rem;
          font-weight: bold;
        }

        ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .rental-card {
          background-color: white;
          border-radius: 1rem;
          margin-bottom: 1.2rem;
          padding: 1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .rental-card h3 {
          color: #004080;
          margin-bottom: 0.5rem;
        }

        .rental-card strong {
          color: #003060;
        }

        .rental-entry {
          background-color: #ffffff;
          padding: 0.75rem;
          margin-top: 0.75rem;
          border-radius: 0.75rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
          font-size: 0.95rem;
          line-height: 1.4;
        }

        .duration-green {
          color: green;
          font-weight: bold;
        }

        .duration-red {
          color: red;
          font-weight: bold;
        }

        .returnComment {
          color: #007bff;
          font-weight: bold;
          margin-top: 0.5rem;
        }

        .startTime {
          color: #28a745;
          font-weight: bold;
        }

        @media screen and (max-width: 600px) {
          .container {
            padding: 0.5rem;
          }

          .filter-form {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-form button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
