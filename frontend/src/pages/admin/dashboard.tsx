// frontend/src/pages/admin/dashboard.tsx
import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

interface Worker {
  id: number;
  username: string;
}

const AdminDashboard: React.FC = () => {
  const [workerUsername, setWorkerUsername] = useState("");
  const [workerPassword, setWorkerPassword] = useState("");
  const [message, setMessage] = useState("");

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth");
      return;
    }
    fetchWorkers(token);
  }, [router]);

  const fetchWorkers = async (token: string) => {
    try {
      const res = await fetch("http://localhost:3001/admin/workers", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const text = await res.clone().text();
        throw new Error(text || "Не удалось загрузить список рабочих.");
      }
      const data = await res.json();
      setWorkers(data);
    } catch (err: any) {
      console.error("Ошибка загрузки рабочих:", err);
      setMessage(err.message || "Ошибка сервера при загрузке рабочих.");
    }
  };

  const handleCreateWorker = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Ошибка: не найден токен авторизации.");
      return;
    }
    try {
      const res = await fetch("http://localhost:3001/auth/worker/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: workerUsername,
          password: workerPassword,
        }),
      });
      if (!res.ok) {
        const text = await res.clone().text();
        throw new Error(text || "Ошибка создания рабочего.");
      }
      setMessage("Рабочий успешно создан!");
      setWorkerUsername("");
      setWorkerPassword("");
      fetchWorkers(token);
    } catch (err: any) {
      console.error("Ошибка создания рабочего:", err);
      setMessage(err.message || "Ошибка сервера.");
    }
  };

  const handleSelectWorker = (id: number) => {
    setSelectedWorkerId((prev) => (prev === id ? null : id));
    setMessage("");
  };

  const handleManageCatamarans = () => {
    if (selectedWorkerId) {
      router.push(`/admin/worker/${selectedWorkerId}/catamarans`);
    } else {
      setMessage("Пожалуйста, выберите рабочего.");
    }
  };

  const handleDeleteWorker = async () => {
    if (!selectedWorkerId) {
      setMessage("Пожалуйста, выберите рабочего для удаления.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Ошибка: не найден токен авторизации.");
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:3001/admin/workers/${selectedWorkerId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) {
        const text = await res.clone().text();
        throw new Error(text || "Ошибка при удалении рабочего.");
      }
      setMessage("Рабочий успешно удалён.");
      setSelectedWorkerId(null);
      fetchWorkers(token);
    } catch (err: any) {
      console.error("Ошибка удаления рабочего:", err);
      setMessage(err.message || "Ошибка сервера при удалении рабочего.");
    }
  };

  return (
    <div className="container">
      <nav style={{ marginBottom: "1.5rem", display: "flex", gap: "0.5rem" }}>
        <Link href="/admin/dashboard" passHref>
          <button
            style={{
              padding: "0.5rem 1rem",
              background: selectedWorkerId === null ? "#0070f3" : "#eee",
              color: selectedWorkerId === null ? "#fff" : "#333",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Рабочие
          </button>
        </Link>
        <Link href="/admin/settings" passHref>
          <button
            style={{
              padding: "0.5rem 1rem",
              background: selectedWorkerId !== null ? "#0070f3" : "#eee",
              color: selectedWorkerId !== null ? "#fff" : "#333",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Настройки времени
          </button>
        </Link>
      </nav>

      <h1 className="page-title">Панель администратора</h1>

      <section className="section">
        <h2 className="section-title">Создать рабочего</h2>
        <form className="form" onSubmit={handleCreateWorker}>
          <input
            className="input"
            type="text"
            placeholder="Имя пользователя"
            value={workerUsername}
            onChange={(e) => setWorkerUsername(e.target.value)}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Пароль"
            value={workerPassword}
            onChange={(e) => setWorkerPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary">
            Создать
          </button>
        </form>
      </section>

      {message && <p className="message">{message}</p>}

      <section className="section">
        <h2 className="section-title">Список рабочих</h2>
        {workers.length === 0 ? (
          <p>Нет созданных рабочих.</p>
        ) : (
          <ul className="list">
            {workers.map((w) => (
              <li
                key={w.id}
                className={
                  "list-item" + (selectedWorkerId === w.id ? " selected" : "")
                }
                onClick={() => handleSelectWorker(w.id)}
              >
                <span style={{ fontSize: "1.25rem", fontWeight: 500 }}>
                  {w.username}
                </span>{" "}
              </li>
            ))}
          </ul>
        )}

        <div className="buttons-row">
          <button onClick={handleManageCatamarans} className="btn">
            Катамараны
          </button>
          <button onClick={handleDeleteWorker} className="btn btn-danger">
            Удалить
          </button>
          <Link href={`/admin/worker/${selectedWorkerId}/report`}>
            <button className="btn btn-report" disabled={!selectedWorkerId}>
              Отчёт
            </button>
          </Link>
        </div>
      </section>

      <style jsx>{`
        /* === Базовые стили для планшетов (≥600px) === */
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }
        .nav {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .nav a {
          text-decoration: none;
          color: #555;
          font-size: 1.1rem;
        }
        .nav a.active {
          text-decoration: underline;
          color: #000;
        }
        .page-title {
          font-size: 2rem;
          margin-bottom: 1.5rem;
        }
        .section {
          margin-bottom: 2rem;
        }
        .section-title {
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }
        .form {
          display: flex;
          flex-direction: column;
        }
        .input {
          font-size: 1.1rem;
          padding: 0.75rem;
          margin-bottom: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .buttons-row {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }
        .btn {
          flex: 1;
          padding: 0.75rem;
          font-size: 1.1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          background: #e0e0e0;
          color: #000;
        }
        .btn:hover:not(:disabled) {
          background: #d5d5d5;
        }
        .btn-primary {
          background: #0070f3;
          color: #fff;
        }
        .btn-primary:hover:not(:disabled) {
          background: #005bb5;
        }
        .btn-danger {
          background: #f44336;
          color: #fff;
        }
        .btn-danger:hover:not(:disabled) {
          background: #d32f2f;
        }
        .btn-report {
          background: #4caf50;
          color: #fff;
        }
        .btn-report:hover:not(:disabled) {
          background: #388e3c;
        }
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .list {
          list-style: none;
          padding: 0;
        }
        .list-item {
          padding: 0.75rem;
          margin-bottom: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          cursor: pointer;
        }
        .list-item.selected {
          border-color: #0070f3;
          background: #e6f0ff;
        }
        .message {
          color: #d32f2f;
          font-size: 1rem;
          margin-bottom: 1.5rem;
        }

        /* === Телефоны (max-width:600px) === */
        @media (max-width: 600px) {
          .container {
            padding: 1rem;
          }
          .nav {
            flex-direction: column;
            gap: 0.5rem;
          }
          .nav a {
            font-size: 1rem;
          }
          .page-title {
            font-size: 1.5rem;
            margin-bottom: 1rem;
          }
          .section-title {
            font-size: 1.2rem;
            margin-bottom: 0.75rem;
          }
          .input {
            font-size: 1rem;
            padding: 0.5rem;
            margin-bottom: 0.75rem;
          }
          .btn {
            font-size: 1rem;
            padding: 0.5rem;
          }
          .buttons-row {
            flex-direction: column;
          }
          .buttons-row .btn {
            width: 100%;
          }
          .list-item {
            font-size: 1rem;
            padding: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
