// frontend/src/pages/admin/settings.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "../../features/settings/settingsApi";

export default function AdminSettingsPage() {
  const router = useRouter();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Защита: только админ
  useEffect(() => {
    if (!token) return void router.replace("/auth");
    try {
      const role = JSON.parse(atob(token.split(".")[1])).role;
      if (role !== "admin") router.replace("/auth");
    } catch {
      router.replace("/auth");
    }
  }, [router, token]);

  // RTK Query для GET
  const {
    data: settings,
    isLoading: isLoadingSettings,
    isError: isErrorSettings,
  } = useGetSettingsQuery();

  // RTK Query для PATCH
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();

  // Локальные поля формы
  const [weekdayLimit, setWeekdayLimit] = useState(0);
  const [weekendLimit, setWeekendLimit] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  // Когда настройки пришли — инициализируем поля
  useEffect(() => {
    if (settings) {
      setWeekdayLimit(settings.weekdayLimit);
      setWeekendLimit(settings.weekendLimit);
    }
  }, [settings]);

  // Обработчик сохранения
  const handleSave = async () => {
    setMessage(null);
    try {
      await updateSettings({ weekdayLimit, weekendLimit }).unwrap();
      setMessage("Сохранено успешно!");
    } catch {
      setMessage("Ошибка при сохранении настроек.");
    }
  };

  // Loading
  if (isLoadingSettings) {
    return <p>Загрузка настроек…</p>;
  }

  // Real error
  if (isErrorSettings) {
    return <p>Не удалось загрузить настройки.</p>;
  }

  // settings гарантированно не undefined
  return (
    <div style={{ padding: "2rem", maxWidth: 400, margin: "0 auto" }}>
      <h1>Глобальные лимиты проката</h1>

      {message && <p>{message}</p>}

      <div style={{ marginBottom: "1rem" }}>
        <label>
          Лимит будней (минут):
          <input
            type="number"
            value={weekdayLimit}
            onChange={(e) => setWeekdayLimit(+e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </label>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          Лимит выходных (минут):
          <input
            type="number"
            value={weekendLimit}
            onChange={(e) => setWeekendLimit(+e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </label>
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        style={{ padding: "0.5rem 1rem" }}
      >
        {isSaving ? "Сохраняем…" : "Сохранить"}
      </button>
    </div>
  );
}
