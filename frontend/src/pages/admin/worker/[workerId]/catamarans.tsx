// frontend/src/pages/admin/worker/[workerId]/catamarans.tsx
import React, { useEffect, FormEvent, useState } from "react";
import { useRouter } from "next/router";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  useGetCatamaransByAdminWorkerQuery,
  useCreateCatamaranMutation,
  useDeleteCatamaranMutation,
} from "../../../../features/catamarans/catamaransApi";

const WorkerCatamaransPage: React.FC = () => {
  const router = useRouter();
  const { workerId } = router.query as { workerId?: string };

  // Превращаем workerId в число или пропускаем запрос
  const numericWorkerId =
    workerId && !Array.isArray(workerId) && !isNaN(+workerId)
      ? Number(workerId)
      : undefined;

  // 1) GET список катамаранов этого рабочего (админ)
  const {
    data: catamarans = [],
    isLoading: loadingList,
    isError: listError,
    refetch,
  } = useGetCatamaransByAdminWorkerQuery(numericWorkerId ?? skipToken, {
    skip: numericWorkerId == null,
  });

  // 2) Мутации создания и удаления
  const [createCatamaran, { isLoading: creating }] =
    useCreateCatamaranMutation();
  const [deleteCatamaran, { isLoading: deleting }] =
    useDeleteCatamaranMutation();

  // 3) Локальные стейты формы
  const [name, setName] = useState("");
  const [notifyOnStart, setNotifyOnStart] = useState(false); // ← новый флаг
  const [timerLimitMinutes, setTimerLimitMinutes] = useState<number | "">("");

  // 4) При изменении рабочего — рефетчим
  useEffect(() => {
    if (numericWorkerId != null) {
      refetch();
    }
  }, [numericWorkerId, refetch]);

  // 5) Создание катамарана
  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (numericWorkerId == null) return;
    try {
      await createCatamaran({
        workerId: numericWorkerId,
        name,
        timerLimitMinutes:
          timerLimitMinutes === "" ? undefined : timerLimitMinutes,
        notifyOnStart, // ← передаём флаг
      }).unwrap();

      // сбрасываем форму
      setName("");
      setTimerLimitMinutes("");
      setNotifyOnStart(false);
    } catch (err) {
      console.error("Ошибка создания катамарана:", err);
    }
  };

  // 6) Удаление катамарана
  const handleDelete = async (catId: number) => {
    if (numericWorkerId == null) return;
    try {
      await deleteCatamaran({
        workerId: numericWorkerId,
        catamaranId: catId,
      }).unwrap();
    } catch (err) {
      console.error("Ошибка удаления катамарана:", err);
    }
  };

  // 7) Рендеринг
  if (!workerId) return <p>Загрузка…</p>;
  if (loadingList) return <p>Загрузка списка…</p>;
  if (listError) return <p>Не удалось загрузить катамараны.</p>;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "1rem" }}>
      <h1>Катамараны рабочего #{numericWorkerId}</h1>

      <form onSubmit={handleCreate} style={{ marginBottom: "1.5rem" }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Название"
          required
          style={{ marginRight: 8 }}
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
          style={{ width: 120, marginRight: 8 }}
        />
        <label
          style={{
            marginRight: 8,
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          <input
            type="checkbox"
            checked={notifyOnStart}
            onChange={(e) => setNotifyOnStart(e.target.checked)}
            style={{ marginRight: 4 }}
          />
          Уведомлять при старте
        </label>
        <button type="submit" disabled={creating}>
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
              padding: "0.5rem 0",
              borderBottom: "1px solid #ddd",
            }}
          >
            <div>
              <strong>{c.name}</strong>{" "}
              {c.timerLimitMinutes != null && (
                <span style={{ color: "#555", marginLeft: 8 }}>
                  (лимит: {c.timerLimitMinutes} мин)
                </span>
              )}
              <span style={{ marginLeft: 12, fontSize: "0.9rem" }}>
                {c.notifyOnStart ? "🔔 оповещения вкл." : "🔕 оповещения выкл."}
              </span>
            </div>
            <button
              onClick={() => handleDelete(c.id)}
              disabled={deleting}
              style={{
                background: "#f44336",
                color: "#fff",
                border: "none",
                padding: "0.25rem 0.5rem",
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
