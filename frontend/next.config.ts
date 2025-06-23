import type { NextConfig } from "next";
import nextPWA from "next-pwa";

const withPWA = nextPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV !== "production",
  buildExcludes: [
    /middleware-manifest\.json$/,
    /app-build-manifest\.json$/,
    /react-loadable-manifest\.json$/,
  ], // для Next 13+
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: "standalone", // ✅ это главное для Docker-сборки
  pageExtensions: ["tsx", "ts", "js", "jsx"],
};

export default withPWA(nextConfig);
