# 微前端实现原理 · 独立实验项目

这是一个**完全独立**的小项目，有自己的 `package.json` 和依赖，不会影响仓库里其他目录（如 `topics/` 复习站）。

## 项目结构

```
projects/micro-frontend/
├── micro-runtime/          # 手写微前端运行时（核心原理）
│   └── src/
│       ├── sandbox.ts      # JS 沙箱（Proxy 伪造 window）
│       ├── loader.ts       # 加载子应用 HTML/JS/CSS
│       └── index.ts        # 注册、路由、mount/unmount
├── main-app/               # 主应用 Shell（端口 5000）
├── sub-app-dashboard/      # 子应用 · 仪表盘（端口 7101）
└── sub-app-settings/       # 子应用 · 设置（端口 7102）
```

## 快速开始

```bash
cd projects/micro-frontend
npm install
npm run dev
```

浏览器打开 **http://localhost:5000**，点击顶部「仪表盘 / 设置中心」切换子应用。

> 需要同时跑 4 个进程：runtime 编译监听 + 主应用 + 两个子应用。`npm run dev` 已用 `concurrently` 一键启动。

## 微前端是怎么实现的？（5 个核心点）

### 1. 主应用（Shell）只做「壳」

主应用负责：布局、导航、登录态、注册子应用、根据路由决定加载谁。  
**不**包含具体业务页面。

### 2. 子应用接入协议（生命周期）

每个子应用导出统一接口，和 single-spa / qiankun 一样：

| 钩子 | 作用 |
|------|------|
| `bootstrap` | 首次加载时初始化 |
| `mount` | 渲染到主应用提供的容器 |
| `unmount` | 卸载、清 DOM、解绑事件 |

本项目中子应用通过 `window.__MICRO_APP_xxx__` 暴露生命周期（见各子应用 `src/main.ts`）。

### 3. 加载子应用（import-html-entry 思路）

运行时 `fetch` 子应用入口 HTML（如 `http://localhost:7101/`），解析其中的 `<script>` / `<link>`，动态插入到页面执行。  
这就是 qiankun 底层 `import-html-entry` 的简化版，见 `micro-runtime/src/loader.ts`。

### 4. JS 隔离（沙箱）

子应用如果直接 `window.xxx = 1` 会污染全局。  
沙箱用 **Proxy** 造一个假 `window`，子应用变量写进沙箱 Map，卸载时清空。  
见 `micro-runtime/src/sandbox.ts`（SnapshotSandbox 简化实现）。

### 5. 样式隔离

子应用 CSS 通过 `<link data-micro-app="name">` 加载，卸载时按标记移除，避免样式残留。

---

## 和 Qiankun 的对应关系

| 本仓库 | Qiankun / 业界 |
|--------|----------------|
| `registerMicroApps` + `start` | `registerMicroApps` + `start` |
| `loadAppFromEntry` | `import-html-entry` |
| `SnapshotSandbox` | `ProxySandbox` / `SnapshotSandbox` |
| hash 路由 `activeWhen` | `activeRule` |
| `micro-app:data` 事件 | `initGlobalState` / props |

## 单独运行子应用

子应用可以脱离主应用独立开发：

```bash
npm run dev:dashboard   # http://localhost:7101
npm run dev:settings    # http://localhost:7102
```

## 后续学习建议

1. 打开 `micro-runtime/src/index.ts`，跟一遍 `mount → unmount` 流程  
2. 切换 Tab 时看左侧「运行日志」和浏览器 Console  
3. 在子应用 `mount` 里改 `sandboxWindow` 上的变量，理解沙箱  
4. 对比 [qiankun 文档](https://qiankun.umijs.org/) 看生产级还多了哪些能力（预加载、资源过滤、umi 插件等）

## 其他专题

后续每个专题都会在 `projects/` 下单独建文件夹，例如：

- `projects/micro-frontend/` ← 当前
- `projects/xxx/` ← 下一个你想学的话题

各自独立装包、独立运行，互不影响。
