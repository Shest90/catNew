// frontend/src/pages/admin/worker/[workerId]/catamarans.tsx
import React, { useEffect, FormEvent, useState } from "react";
import { useRouter } from "next/router";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  useGetCatamaransByAdminWorkerQuery,
  useCreateCatamaranMutation,
  useDeleteCatamaranMutation,
} from "../../../../features/catamarans/catamaransApi";

interface Worker {
  id: number;
  username: string;
}

const WorkerCatamaransPage: React.FC = () => {
  const router = useRouter();
  const { workerId } = router.query as { workerId?: string };

  // 1) Преобразуем workerId
  const numericWorkerId =
    workerId && !Array.isArray(workerId) && !isNaN(+workerId)
      ? Number(workerId)
      : undefined;

  // 2) Состояние для имени
  const [workerName, setWorkerName] = useState<string>("");

  // 3) При монтировании — подгружаем имя через общий endpoint /admin/workers
  useEffect(() => {
    if (!numericWorkerId) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("http://localhost:3001/admin/workers", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Не удалось загрузить рабочих");
        return res.json() as Promise<Worker[]>;
      })
      .then((list) => {
        const me = list.find((w) => w.id === numericWorkerId);
        if (me) setWorkerName(me.username);
      })
      .catch(console.error);
  }, [numericWorkerId]);

  // 4) RTK Query для катамаранов
  const {
    data: catamarans = [],
    isLoading: loadingList,
    isError: listError,
    refetch,
  } = useGetCatamaransByAdminWorkerQuery(numericWorkerId ?? skipToken, {
    skip: numericWorkerId == null,
  });

  const [createCatamaran, { isLoading: creating }] =
    useCreateCatamaranMutation();
  const [deleteCatamaran, { isLoading: deleting }] =
    useDeleteCatamaranMutation();

  const [name, setName] = useState("");
  const [notifyOnStart, setNotifyOnStart] = useState(false);
  const [timerLimitMinutes, setTimerLimitMinutes] = useState<number | "">("");

  useEffect(() => {
    if (numericWorkerId != null) refetch();
  }, [numericWorkerId, refetch]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (numericWorkerId == null) return;
    await createCatamaran({
      workerId: numericWorkerId,
      name,
      timerLimitMinutes:
        timerLimitMinutes === "" ? undefined : timerLimitMinutes,
      notifyOnStart,
    }).unwrap();
    setName("");
    setTimerLimitMinutes("");
    setNotifyOnStart(false);
  };

  const handleDelete = async (catId: number) => {
    if (numericWorkerId == null) return;
    await deleteCatamaran({
      workerId: numericWorkerId,
      catamaranId: catId,
    }).unwrap();
  };

  if (!workerId) return <p>Загрузка…</p>;
  if (loadingList) return <p>Загрузка списка…</p>;
  if (listError) return <p>Не удалось загрузить катамараны.</p>;

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "0 auto",
        padding: "1rem",
      }}
    >
      {/* Показываем имя, если подгрузилось, иначе ID */}
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
        Катамараны рабочего{" "}
        <span style={{ color: "#0070f3" }}>
          {workerName || `#${numericWorkerId}`}
        </span>
      </h1>

      <form
        onSubmit={handleCreate}
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Название"
          required
          style={{
            flex: "1 1 200px",
            padding: "0.5rem",
            fontSize: "1rem",
          }}
        />
        <input
          type="number"
          value={timerLimitMinutes}
          onChange={(e) =>
            setTimerLimitMinutes(
              e.target.value === "" ? "" : Number(e.target.value)
            )
          }
          placeholder="Лимит (мин)"
          style={{
            flex: "0 0 120px",
            padding: "0.5rem",
            fontSize: "1rem",
          }}
        />
        <label
          style={{
            flex: "0 0 auto",
            display: "inline-flex",
            alignItems: "center",
            fontSize: "0.9rem",
          }}
        >
          <input
            type="checkbox"
            checked={notifyOnStart}
            onChange={(e) => setNotifyOnStart(e.target.checked)}
            style={{ marginRight: "0.25rem" }}
          />
          Уведомлять при старте
        </label>
        <button
          type="submit"
          disabled={creating}
          style={{
            flex: "0 0 120px",
            padding: "0.5rem",
            fontSize: "1rem",
            background: "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          {creating ? "Создаём…" : "Создать"}
        </button>
      </form>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {catamarans.map((c) => (
          <li
            key={c.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.75rem",
              borderBottom: "1px solid #ddd",
            }}
          >
            <div>
              <strong style={{ fontSize: "1.1rem" }}>{c.name}</strong>{" "}
              {c.timerLimitMinutes != null && (
                <span style={{ color: "#555", marginLeft: 8 }}>
                  (лимит: {c.timerLimitMinutes} мин)
                </span>
              )}
              <span style={{ marginLeft: 12, fontSize: "0.9rem" }}>
                {c.notifyOnStart ? "🔔 Оповещения включены" : "🔕 Выключены"}
              </span>
            </div>
            <button
              onClick={() => handleDelete(c.id)}
              disabled={deleting}
              style={{
                background: "#f44336",
                color: "#fff",
                border: "none",
                padding: "0.5rem",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Удалить
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WorkerCatamaransPage;
