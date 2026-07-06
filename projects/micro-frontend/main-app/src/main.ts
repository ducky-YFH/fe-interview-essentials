/**
 * 主应用入口（Shell / 基座应用）
 *
 * 【职责】
 * - 渲染整体布局（顶栏、侧栏、子应用容器）
 * - 注册子应用、启动微前端运行时
 * - 监听 runtime 日志并展示在页面上
 *
 * 【不负责】
 * - 仪表盘、设置页的具体业务 UI（那是子应用的事）
 */

import { createMicroFrontendRuntime } from "@lab/micro-runtime";
import "./style.css";

// 主应用根节点，例如 <div id="app">
const appEl = document.querySelector<HTMLDivElement>("#app")!;

// 搭建主应用骨架 HTML
appEl.innerHTML = `
  <header class="shell-header">
    <div class="brand">
      <span class="logo">🧩</span>
      <div>
        <h1>微前端主应用（Shell）</h1>
        <p>手写 runtime 加载子应用 · 观察沙箱与生命周期</p>
      </div>
    </div>
    <nav class="shell-nav">
      <a href="#/dashboard" data-link>仪表盘</a>
      <a href="#/settings" data-link>设置中心</a>
    </nav>
  </header>
  <section class="shell-body">
    <aside class="shell-aside">
      <h2>运行日志</h2>
      <ul id="log-list"></ul>
      <div class="tip">
        <strong>原理提示</strong>
        <p>切换 Tab 时会触发子应用 <code>unmount → mount</code>，并重建 JS 沙箱。</p>
      </div>
    </aside>
    <main class="shell-main">
      <!-- 子应用 mount 时会把 UI 插到这个 div 里 -->
      <div id="subapp-container"></div>
    </main>
  </section>
`;

const logList = document.querySelector<HTMLDivElement>("#log-list")!;

/**
 * 往左侧日志面板追加一条记录
 * @param text 例如 "已挂载子应用: dashboard（沙箱变量数: 2）"
 */
function appendLog(text: string) {
  const li = document.createElement("li");
  li.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
  logList.prepend(li);
}

// runtime 内部 log() 会派发 micro-app:log，这里接住并显示
window.addEventListener("micro-app:log", (e) => {
  appendLog((e as CustomEvent<string>).detail);
});

// 创建微前端运行时实例（相当于迷你版 qiankun）
const runtime = createMicroFrontendRuntime();

/**
 * 注册子应用列表
 * - name: 唯一标识
 * - entry: 子应用 dev server 地址，runtime 会 fetch 它的 index.html
 * - activeWhen: 当前 hash 匹配时才激活
 */
runtime.registerMicroApps([
  {
    name: "dashboard",
    entry: "http://localhost:7101/",
    // 例如 location.hash === "#/dashboard" 或 "#/dashboard/detail" 都匹配
    activeWhen: (loc) => loc.hash.startsWith("#/dashboard"),
  },
  {
    name: "settings",
    entry: "http://localhost:7102/",
    activeWhen: (loc) => loc.hash.startsWith("#/settings"),
  },
]);

// 开始监听 hash 路由，自动加载/卸载子应用
runtime.start();

// 首次打开没有 hash 时，默认进仪表盘
// 例如 "" 或 "#/" → 改成 "#/dashboard"
if (!location.hash || location.hash === "#/") {
  location.hash = "#/dashboard";
}

// 点击导航时，顺便给子应用发一条广播数据（演示主→子通信）
document.querySelectorAll<HTMLAnchorElement>("[data-link]").forEach((link) => {
  link.addEventListener("click", () => {
    runtime.setGlobalData({
      from: "main-app",
      at: Date.now(), // 例如 1710000000123
    });
  });
});

appendLog("主应用已启动，等待加载子应用…");
