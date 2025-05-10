// frontend/src/pages/admin/dashboard.tsx
import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

interface Worker {
  id: number;
  username: string;
}

const AdminDashboard: React.FC = () => {
  const [workerUsername, setWorkerUsername] = useState<string>("");
  const [workerPassword, setWorkerPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");

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
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "1rem" }}>
      {/* Навигация без <a> внутри Link */}
      <nav style={{ marginBottom: "1.5rem" }}>
        <Link
          href="/admin/dashboard"
          style={{
            marginRight: 16,
            textDecoration: selectedWorkerId === null ? "underline" : "none",
          }}
        >
          Рабочие
        </Link>
        <Link href="/admin/settings">Настройки времени</Link>
      </nav>

      <h1>Панель администратора</h1>

      {/* Форма создания рабочего */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>Создать рабочего</h2>
        <form onSubmit={handleCreateWorker}>
          <div style={{ marginBottom: 8 }}>
            <input
              type="text"
              placeholder="Имя пользователя"
              value={workerUsername}
              onChange={(e) => setWorkerUsername(e.target.value)}
              required
              style={{ width: "100%", padding: 8 }}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <input
              type="password"
              placeholder="Пароль"
              value={workerPassword}
              onChange={(e) => setWorkerPassword(e.target.value)}
              required
              style={{ width: "100%", padding: 8 }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: 12,
              width: "100%",
              background: "#0070f3",
              color: "#fff",
              border: "none",
              borderRadius: 4,
            }}
          >
            Создать
          </button>
        </form>
      </section>

      {message && (
        <p style={{ color: "red", marginBottom: "1rem" }}>{message}</p>
      )}

      {/* Список рабочих */}
      <section>
        <h2>Список рабочих</h2>
        {workers.length === 0 ? (
          <p>Нет созданных рабочих.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {workers.map((w) => (
              <li
                key={w.id}
                onClick={() => handleSelectWorker(w.id)}
                style={{
                  padding: 8,
                  marginBottom: 4,
                  border:
                    selectedWorkerId === w.id
                      ? "2px solid #0070f3"
                      : "1px solid #ccc",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                {w.username} (ID: {w.id})
              </li>
            ))}
          </ul>
        )}
        <div style={{ marginTop: "1rem", display: "flex", gap: 8 }}>
          <button
            onClick={handleManageCatamarans}
            style={{ flex: 1, padding: 12 }}
          >
            Управлять катамаранами
          </button>
          <button
            onClick={handleDeleteWorker}
            style={{
              flex: 1,
              padding: 12,
              background: "#f44336",
              color: "#fff",
              border: "none",
              borderRadius: 4,
            }}
          >
            Удалить рабочего
          </button>
          <Link href={`/admin/worker/${selectedWorkerId}/report`}>
            <button
              disabled={selectedWorkerId === null}
              style={{
                flex: 1,
                padding: 12,
                background: "#4caf50",
                color: "#fff",
                border: "none",
                borderRadius: 4,
              }}
            >
              Отчёт
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
