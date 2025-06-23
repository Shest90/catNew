// pages/_document.tsx
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Подключение манифеста */}
        <link rel="manifest" href="/manifest.json" />
        {/* Иконки (опционально) */}
        <link rel="icon" href="/icons/favicon-192x192.png" />
        <meta name="theme-color" content="#000000" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
