# FE Interview Essentials

前端面试复习 · 精练版。按专题整理高频题，带实战场景，支持自测与进度记录。

纯静态 HTML，无需安装依赖，浏览器直接打开即可使用。

## 快速开始

```bash
open index.html
```

或用 VS Code / Cursor 的 Live Server 打开 `index.html` 也可以。

## 怎么用

1. 从 [index.html](./index.html) 选择专题
2. **先自己做** — 看场景/题目，尝试口述或写代码
3. 点击 **「查看答案」** 对照
4. 勾选 **「已掌握」** — 进度保存在浏览器 `localStorage`
5. 专题页顶部：
   - **📝 自测模式** — 折叠全部答案
   - **📖 复习模式** — 展开全部答案
6. 时间紧 — 只做各专题 **精练路径** 里带 ⭐ 的题

## 专题列表（26 个专题 · 309 题）

| 专题 | 题数 | 说明 |
|------|------|------|
| [🌐 跨域](./topics/cors.html) | 8 | CORS、预检、Cookie 跨域、开发代理 |
| [🔐 HTTP & 安全](./topics/http.html) | 10 | 状态码、JWT、XSS、CSRF |
| [💾 浏览器缓存](./topics/cache.html) | 6 | 强缓存 / 协商缓存、构建产物策略 |
| [🎨 渲染 & 性能](./topics/rendering.html) | 12 | 重排重绘、虚拟列表、图片懒加载、LCP |
| [📐 CSS 布局](./topics/css.html) | 12 | BFC、Flex、SCSS、rem/vw 移动端适配 |
| [🔒 闭包](./topics/closure.html) | 15 | 循环坑、防抖节流、私有变量 |
| [🧩 类型 & 拷贝](./topics/types.html) | 10 | typeof、==、深浅拷贝 |
| [✍️ 手写题](./topics/handwrite.html) | 12 | flatten、权限指令、ProTable、并发池 |
| [⏳ Promise](./topics/promise.html) | 26 | 状态、链式、静态方法、async/await |
| [⚡ 异步并发](./topics/concurrency.html) | 10 | 限流 runPool、重试、AbortController |
| [🔄 事件循环](./topics/eventloop.html) | 10 | 宏/微任务、输出顺序、rAF |
| [📘 TypeScript](./topics/typescript.html) | 36 | 类型推断、泛型、工具类型 |
| [💚 Vue3](./topics/vue3.html) | 16 | 响应式、Diff、Pinia、生命周期、v-model |
| [💚 Vue2](./topics/vue2.html) | 6 | defineProperty、Vuex、mixin、Options API |
| [🛣 Vue Router & 权限](./topics/vue-router.html) | 8 | 导航守卫、动态路由、按钮级权限 |
| [🧱 组件封装](./topics/components.html) | 8 | 配置式表格、弹窗、查询、文件预览 |
| [🖥 Electron](./topics/electron.html) | 10 | IPC、preload、本地文件、AI 任务 |
| [📱 小程序 & UniApp](./topics/miniapp.html) | 10 | setData、登录支付、Canvas、性能 |
| [📤 文件上传 & OSS](./topics/upload.html) | 8 | 秒传、分片、并发任务中心 |
| [⚙️ 工程化](./topics/engineering.html) | 11 | Vite/Webpack、Monorepo、UI 按需加载 |
| [🌿 Git 协作](./topics/git.html) | 6 | merge/rebase、冲突、分支策略 |
| [🟢 NestJS 基础](./topics/nestjs.html) | 6 | Module/Controller/Service、DTO、联调 |
| [📊 ECharts 可视化](./topics/echarts.html) | 6 | 图表集成、联动、大数据优化 |
| [🔗 原型链 & 继承](./topics/prototype.html) | 12 | prototype、new、继承方式 |
| [🎯 this 指向](./topics/this.html) | 10 | 四绑定、call/bind、事件丢失 |
| [🏹 箭头函数](./topics/arrow.html) | 25 | 箭头 vs 普通、输出题（部分可运行） |

**合计 309 题。**

### 推荐刷题组合

**Async 三件套**：

```
Promise → 异步并发 → 事件循环
```

**JS 核心**：

```
闭包 → 类型 & 拷贝 → 原型链 → this 指向 → 箭头函数 → 手写题 → Async 三件套
```

**网络四件套**：

```
跨域 → HTTP & 安全 → 浏览器缓存 → 渲染 & 性能
```

**Vue 全栈（简历匹配）**：

```
Vue2 → Vue3 → Vue Router & 权限 → 组件封装 → TypeScript
```

**跨端 + 桌面（猫咔项目）**：

```
文件上传 & OSS → Electron → 小程序 & UniApp → 工程化 → 异步并发
```

**BPO 后台方向**：

```
Vue2 → 组件封装 → ECharts → HTTP & 安全 → Git 协作
```

**面试前 3 天速刷**（每专题只练精练路径）：

```
Day1: Vue3 + Vue Router + 组件封装 + 上传
Day2: 小程序 + Electron + 异步并发 + HTTP
Day3: 渲染 + Vue2 + 工程化 + 手写题
```

## 项目结构

```
fe-interview-essentials/
├── index.html
├── topics/
│   ├── cors.html
│   ├── http.html
│   ├── cache.html
│   ├── rendering.html
│   ├── css.html
│   ├── closure.html
│   ├── types.html
│   ├── handwrite.html
│   ├── promise.html
│   ├── concurrency.html
│   ├── eventloop.html
│   ├── typescript.html
│   ├── vue3.html
│   ├── vue2.html
│   ├── vue-router.html
│   ├── components.html
│   ├── electron.html
│   ├── miniapp.html
│   ├── upload.html
│   ├── engineering.html
│   ├── git.html
│   ├── nestjs.html
│   ├── echarts.html
│   ├── prototype.html
│   ├── this.html
│   └── arrow.html
└── assets/
    ├── css/style.css
    └── js/app.js
```

## 功能说明

| 功能 | 说明 |
|------|------|
| 精练路径 | 每专题顶部列出时间紧时必做的题 |
| 必练 / 选练 | 卡片 badge 标注优先级 |
| 实战场景 | 多数题目带 📌 业务场景 |
| 进度持久化 | `localStorage` 键名 `fe-review-progress` |
| 运行代码 | 部分专题支持页面内运行输出 |

## 技术栈

- HTML + CSS + 原生 JavaScript
- 无构建工具、无框架、无后端

## License

MIT
