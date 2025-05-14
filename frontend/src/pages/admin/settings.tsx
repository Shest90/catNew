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

  // Локальные поля формы как строки, по умолчанию пустые
  const [weekdayLimit, setWeekdayLimit] = useState<string>("");
  const [weekendLimit, setWeekendLimit] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);

  // Когда настройки пришли — инициализируем поля строковыми значениями
  useEffect(() => {
    if (settings) {
      setWeekdayLimit(
        settings.weekdayLimit && settings.weekdayLimit > 0
          ? settings.weekdayLimit.toString()
          : ""
      );
      setWeekendLimit(
        settings.weekendLimit && settings.weekendLimit > 0
          ? settings.weekendLimit.toString()
          : ""
      );
    }
  }, [settings]);

  // Обработчик сохранения
  const handleSave = async () => {
    setMessage(null);
    try {
      // парсим в числа и отправляем
      await updateSettings({
        weekdayLimit: parseInt(weekdayLimit, 10) || 0,
        weekendLimit: parseInt(weekendLimit, 10) || 0,
      }).unwrap();
      setMessage("Сохранено успешно!");
    } catch {
      setMessage("Ошибка при сохранении настроек.");
    }
  };

  if (isLoadingSettings) return <p className="info">Загрузка настроек…</p>;
  if (isErrorSettings)
    return <p className="info">Не удалось загрузить настройки.</p>;

  return (
    <div className="container">
      <h1>Глобальные лимиты проката</h1>

      {message && <p className="message">{message}</p>}

      <div className="field">
        <label>
          Лимит будней (минут):
          <input
            type="number"
            placeholder="Введите лимит"
            value={weekdayLimit}
            onChange={(e) => setWeekdayLimit(e.target.value)}
          />
        </label>
      </div>

      <div className="field">
        <label>
          Лимит выходных (минут):
          <input
            type="number"
            placeholder="Введите лимит"
            value={weekendLimit}
            onChange={(e) => setWeekendLimit(e.target.value)}
          />
        </label>
      </div>

      <button onClick={handleSave} disabled={isSaving}>
        {isSaving ? "Сохраняем…" : "Сохранить"}
      </button>

      <style jsx>{`
        .container {
          padding: 2rem;
          max-width: 400px;
          margin: 0 auto;
        }
        h1 {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .field {
          margin-bottom: 1rem;
        }
        label {
          display: block;
          font-size: 1rem;
          margin-bottom: 0.25rem;
        }
        input {
          width: 100%;
          padding: 0.75rem;
          font-size: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-sizing: border-box;
        }
        button {
          display: block;
          width: 100%;
          padding: 0.75rem;
          font-size: 1rem;
          background: #0070f3;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .message {
          color: green;
          margin-bottom: 1rem;
          text-align: center;
        }
        .info {
          text-align: center;
          padding: 2rem;
        }
        /* Планшеты */
        @media (min-width: 768px) {
          .container {
            max-width: 600px;
          }
          input {
            font-size: 1.1rem;
          }
          button {
            font-size: 1.1rem;
          }
        }
        /* Телефоны */
        @media (max-width: 480px) {
          .container {
            padding: 1rem;
          }
          input {
            padding: 0.5rem;
            font-size: 0.95rem;
          }
          button {
            padding: 0.5rem;
            font-size: 0.95rem;
          }
        }
      `}</style>
    </div>
  );
}
