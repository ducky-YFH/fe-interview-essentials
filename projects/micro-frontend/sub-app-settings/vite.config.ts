/**
 * Vite 配置 — 子应用 settings
 * 端口 7102，需开启 CORS 供主应用加载
 */
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 7102,
    cors: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
});
