// next.config.ts
import type { NextConfig } from "next";
import nextPWA from "next-pwa";
import { join } from "path";

const withPWA = nextPWA({
  dest: "public", // куда класть sw.js
  register: true, // автоподключение скрипта регистрации
  disable: process.env.NODE_ENV === "development", // не пхать PWA в режиме dev
  // при необходимости можно добавить runtimeCaching и другие опции workbox
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // здесь ваши другие опции Next.js
};

export default withPWA(nextConfig);
