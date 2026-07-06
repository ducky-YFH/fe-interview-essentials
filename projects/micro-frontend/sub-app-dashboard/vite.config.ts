/**
 * Vite 配置 — 子应用 dashboard
 *
 * 子应用必须允许跨域，主应用（localhost:5000）才能 fetch 它的 HTML/JS
 */
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 7101, // 仪表盘子应用端口，和主应用 entry 配置一致
    cors: true,
    headers: {
      // 允许主应用跨域请求本应用的资源
      "Access-Control-Allow-Origin": "*",
    },
  },
});
