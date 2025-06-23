// frontend/src/components/Timer.tsx
import React, { useEffect, useState, useRef } from "react";
import { useTimersStore } from "../store/timersStore";
import { useCreateCommentMutation } from "../features/comments/commentsApi";
import {
  useStartRentalMutation,
  useFinishRentalMutation,
} from "../features/catamarans/catamaransApi";

// Стили для модалки
const primaryColor = "#0056b3"; // $primary-color
// const secondaryColor = "#071369"; // $secondary-color
const successColor = "#067905"; // $success-color
const errorColor = "#dc3545"; // $error-color

const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  padding: "1rem",
  borderRadius: "8px",
  maxWidth: "400px",
  width: "90%",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
};

interface TimerProps {
  id: string;
  catamaranId: number;
  limitMinutes?: number | null;
  count: number;
  onReset?: () => void;
}

const Timer: React.FC<TimerProps> = ({
  id,
  catamaranId,
  limitMinutes,
  count,
  onReset,
}) => {
  const { timers, startTimer, pauseTimer, resetTimer } = useTimersStore();
  const [startRental] = useStartRentalMutation();
  const [finishRental] = useFinishRentalMutation();
  const [createComment] = useCreateCommentMutation();

  const [showModal, setShowModal] = useState(false);
  const [commentText, setCommentText] = useState("");

  const [rentalId, setRentalId] = useState<number | null>(null);

  // Восстанавливаем rentalId из localStorage при монтировании
  useEffect(() => {
    const saved = localStorage.getItem(`rental_${id}`);
    if (saved) setRentalId(Number(saved));
  }, [id]);

  // Форс-обновление каждую секунду
  const [, forceUpdate] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    intervalRef.current = setInterval(() => forceUpdate((n) => n + 1), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Расчёт времени
  const { elapsed = 0, lastStart = null } = timers[id] ?? {};
  const extra = lastStart ? Math.floor((Date.now() - lastStart) / 1000) : 0;
  const total = elapsed + extra;
  const isRunning = lastStart != null;
  const over = limitMinutes != null && total / 60 > limitMinutes;

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600),
      m = Math.floor((s % 3600) / 60),
      sec = s % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // Запуск таймера и регистрация проката
  const handleStart = async () => {
    if (!isRunning) {
      startTimer(id);
      if (rentalId == null) {
        try {
          const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          console.log("Отправляем timeZone:", timeZone);
          const res = await startRental({
            catamaranId,
            count,
            timeZone,
          }).unwrap();
          setRentalId(res.id);
          localStorage.setItem(`rental_${id}`, res.id.toString());
        } catch (e) {
          console.error("Не удалось запустить прокат:", e);
        }
      }
    }
  };

  // Стоп или сброс
  const handleStopReset = async () => {
    if (isRunning) {
      pauseTimer(id);
    } else if (total > 0) {
      if (rentalId != null) {
        const durationMinutes = Math.round(total / 60);
        try {
          await finishRental({
            catamaranId,
            rentalId,
            durationMinutes,
            count,
          }).unwrap();
          localStorage.removeItem(`rental_${id}`);
        } catch (e) {
          console.error("Не удалось завершить прокат:", e);
        }
        setRentalId(null);
      }
      resetTimer(id);
      onReset?.();
    }
  };

  // Открыть модалку для комментария
  const openCommentModal = () => {
    if (isRunning) pauseTimer(id);
    setShowModal(true);
  };

  // Отправить комментарий + сброс
  const handleCommentSubmit = async () => {
    if (!commentText.trim() || rentalId == null) return;
    try {
      await createComment({
        catamaranId,
        rentalId,
        text: commentText,
      }).unwrap();
      await handleStopReset();
      setShowModal(false);
      setCommentText("");
    } catch (err) {
      console.error("Ошибка отправки комментария:", err);
    }
  };

  return (
    <div>
      {/* Отображение времени */}

      {/* Кнопки управления */}
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
        {/* Start — пастельный зелёный */}
        <button
          onClick={handleStart}
          disabled={isRunning}
          style={{
            fontSize: "1rem",
            backgroundColor: isRunning ? primaryColor : successColor,
            color: "#fff",
            border: "none",
            padding: "0.6rem 1rem",
            borderRadius: "20px",
            cursor: isRunning ? "not-allowed" : "pointer",
            opacity: isRunning ? 0.4 : 1,
          }}
        >
          Старт
        </button>

        {/* Stop / Reset — пастельный жёлтый или красный */}
        <button
          onClick={handleStopReset}
          disabled={total === 0}
          style={{
            fontSize: "1rem",
            backgroundColor: total > 0 ? errorColor : primaryColor,
            color: "#fff",
            border: "none",
            borderRadius: "20px",
            cursor: total === 0 ? "not-allowed" : "pointer",
            opacity: total === 0 ? 0.4 : 1,
          }}
        >
          {isRunning ? "Стоп" : "Сброс"}
        </button>
      </div>
      <div
        style={{
          fontSize: "1.8rem",
          fontWeight: "700",
          color: over ? errorColor : successColor, // если over — пастельный красный, иначе тёмный
          backgroundColor: over ? "#f3b7bd" : "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        {formatTime(total)}
      </div>
      {/* Comment — пастельный лаванда (или другой пастельный тон) */}
      <button
        onClick={openCommentModal}
        disabled={total === 0}
        style={{
          fontSize: "1rem",
          backgroundColor: primaryColor,
          color: "#fff",
          border: "none",
          padding: "0.6rem 1rem",
          borderRadius: "20px",
          cursor: total === 0 ? "not-allowed" : "pointer",
          opacity: total === 0 ? 0.4 : 1,
        }}
      >
        Возврат катамарана
      </button>

      {/* Модальное окно комментария */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h3>Оставить комментарий</h3>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={4}
              style={{
                width: "100%",
                marginBottom: "0.5rem",
                fontSize: "1.3rem",
              }}
            />
            <div style={{ textAlign: "right" }}>
              <button
                onClick={handleCommentSubmit}
                disabled={!commentText.trim()}
                style={{
                  background: "#0070f3",
                  color: "#333",
                  padding: "0.5rem 1rem",
                  border: "1px solid #a8e6cf",
                  borderRadius: 4,
                  marginRight: 8,
                  fontSize: "1rem",
                  fontWeight: "700",
                }}
              >
                Отправить и Сброс
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "#e4620c",
                  color: "#333",
                  padding: "0.5rem 1rem",
                  border: "1px solid #ffd3b6",
                  borderRadius: 4,
                  fontSize: "1rem",
                  fontWeight: "700",
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timer;
