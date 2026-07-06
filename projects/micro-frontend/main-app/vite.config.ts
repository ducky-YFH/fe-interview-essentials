/**
 * Vite 配置 — 主应用
 *
 * 主应用跑在 http://localhost:5000
 * 需要能 import 手写运行时 @lab/micro-runtime
 */
import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  server: {
    port: 5000, // 主应用端口
    open: true, // 启动后自动打开浏览器
  },
  resolve: {
    alias: {
      // 指向 micro-runtime 编译产物，例如 ../micro-runtime/dist/index.js
      "@lab/micro-runtime": path.resolve(__dirname, "../micro-runtime/dist/index.js"),
    },
  },
});
