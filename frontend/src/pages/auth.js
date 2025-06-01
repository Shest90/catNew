// pages/auth.js
import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function Auth() {
  const [isLoginActive, setIsLoginActive] = useState(true);

  // состояния форм
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleLoginSubmit(e) {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
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
        router.push(
          data.role === "admin" ? "/admin/dashboard" : "/worker/dashboard"
        );
      } else {
        setMessage(data.message || "Ошибка авторизации");
      }
    } catch {
      setMessage("Сервер недоступен");
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/admin/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: registerUsername,
            email: registerEmail,
            password: registerPassword,
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMessage("Регистрация успешна, войдите в систему");
        setIsLoginActive(true);
      } else {
        setMessage(data.message || "Ошибка регистрации");
      }
    } catch {
      setMessage("Сервер недоступен");
    }
  }

  return (
    <>
      <Head>
        <title>Авторизация / Регистрация</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="auth-container">
        <h1 className="title">Авторизация / Регистрация</h1>

        <div className="toggle-buttons">
          <button
            className={isLoginActive ? "active" : ""}
            onClick={() => setIsLoginActive(true)}
          >
            Вход
          </button>
          <button
            className={!isLoginActive ? "active" : ""}
            onClick={() => setIsLoginActive(false)}
          >
            Регистрация
          </button>
        </div>

        {isLoginActive ? (
          <form className="form" onSubmit={handleLoginSubmit}>
            <input
              type="text"
              placeholder="Имя пользователя"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Пароль"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
            <button type="submit" className="submit">
              Войти
            </button>
          </form>
        ) : (
          <form className="form" onSubmit={handleRegisterSubmit}>
            <input
              type="text"
              placeholder="Имя пользователя"
              value={registerUsername}
              onChange={(e) => setRegisterUsername(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Пароль"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              required
            />
            <button type="submit" className="submit">
              Зарегистрироваться
            </button>
          </form>
        )}

        {message && <p className="message">{message}</p>}
      </div>

      <style jsx>{`
        /* === По умолчанию — для планшетов (ширина >= 600px) === */
        .auth-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          min-height: 100vh;
          justify-content: center;
          background: #f9f9f9;
        }
        .title {
          text-align: center;
          margin-bottom: 1.5rem;
          font-size: 2rem;
        }
        .toggle-buttons {
          display: flex;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 1.5rem;
        }
        .toggle-buttons button {
          flex: 1;
          padding: 0.75rem;
          font-size: 1.2rem;
          border: none;
          background: #e0e0e0;
          color: #333;
          cursor: pointer;
          transition: background 0.2s;
        }
        .toggle-buttons button.active {
          background: #0070f3;
          color: #fff;
        }
        .form {
          display: flex;
          flex-direction: column;
        }
        .form input {
          font-size: 1.1rem;
          padding: 1rem;
          margin-bottom: 1rem;
          border: 1px solid #ccc;
          border-radius: 6px;
          outline: none;
          transition: border-color 0.2s;
        }
        .form input:focus {
          border-color: #0070f3;
        }
        .submit {
          font-size: 1.2rem;
          padding: 1rem;
          background: #0070f3;
          color: #fff;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .submit:hover {
          background: #005bb5;
        }
        .message {
          margin-top: 1.5rem;
          text-align: center;
          color: #d32f2f;
          font-size: 1rem;
        }

        /* === Для смартфонов (ширина < 600px) === */
        @media (max-width: 600px) {
          .auth-container {
            max-width: 360px;
            padding: 1rem;
          }
          .title {
            font-size: 1.5rem;
            margin-bottom: 1rem;
          }
          .toggle-buttons button {
            padding: 0.5rem;
            font-size: 1rem;
          }
          .form input {
            font-size: 1rem;
            padding: 0.75rem;
            margin-bottom: 0.75rem;
          }
          .submit {
            font-size: 1rem;
            padding: 0.75rem;
          }
          .message {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </>
  );
}
