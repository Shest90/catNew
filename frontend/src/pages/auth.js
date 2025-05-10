// pages/auth.js
import { useState } from "react";
import { useRouter } from "next/router";

export default function Auth() {
  const [isLoginActive, setIsLoginActive] = useState(true);

  // Состояния для формы авторизации
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Состояния для формы регистрации
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState(""); // ← добавили
  const [registerPassword, setRegisterPassword] = useState("");

  const [message, setMessage] = useState("");
  const router = useRouter();

  // Обработчик для авторизации
  async function handleLoginSubmit(e) {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
        }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        setMessage("Авторизация успешна!");
        if (data.role === "admin") {
          router.push("/admin/dashboard");
        } else if (data.role === "worker") {
          router.push("/worker/dashboard");
        }
      } else {
        setMessage("Ошибка авторизации");
      }
    } catch (error) {
      console.error(error);
      setMessage("Ошибка сервера");
    }
  }

  // Обработчик для регистрации администратора
  async function handleRegisterSubmit(e) {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("http://localhost:3001/auth/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: registerUsername,
          email: registerEmail, // ← передаём email
          password: registerPassword,
        }),
      });
      if (res.ok) {
        setMessage("Регистрация успешна! Теперь войдите в систему.");
        setIsLoginActive(true);
      } else {
        const err = await res.json();
        setMessage(err.message || "Ошибка регистрации");
      }
    } catch (error) {
      console.error(error);
      setMessage("Ошибка сервера");
    }
  }

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "1rem" }}>
      <h1>Авторизация / Регистрация</h1>
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => setIsLoginActive(true)}
          style={{
            fontWeight: isLoginActive ? "bold" : "normal",
            marginRight: "1rem",
          }}
        >
          Вход
        </button>
        <button
          onClick={() => setIsLoginActive(false)}
          style={{ fontWeight: !isLoginActive ? "bold" : "normal" }}
        >
          Регистрация
        </button>
      </div>

      {isLoginActive ? (
        // ——— Форма входа ———
        <form onSubmit={handleLoginSubmit}>
          <input
            type="text"
            placeholder="Имя пользователя"
            value={loginUsername}
            onChange={(e) => setLoginUsername(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
          />
          <input
            type="password"
            placeholder="Пароль"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
          />
          <button type="submit" style={{ padding: "0.5rem", width: "100%" }}>
            Войти
          </button>
        </form>
      ) : (
        // ——— Форма регистрации ———
        <form onSubmit={handleRegisterSubmit}>
          <input
            type="text"
            placeholder="Имя пользователя"
            value={registerUsername}
            onChange={(e) => setRegisterUsername(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
          />
          <input
            type="email" // ← добавлено поле email
            placeholder="Email"
            value={registerEmail}
            onChange={(e) => setRegisterEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
          />
          <input
            type="password"
            placeholder="Пароль"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
          />
          <button type="submit" style={{ padding: "0.5rem", width: "100%" }}>
            Зарегистрироваться
          </button>
        </form>
      )}

      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
    </div>
  );
}
