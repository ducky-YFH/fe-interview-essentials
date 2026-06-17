# FE Interview Essentials

前端面试复习 · 精练版。按专题整理高频题，带实战场景，支持自测与进度记录。

纯静态 HTML，无需安装依赖，浏览器直接打开即可使用。

## 快速开始

```bash
# 克隆后直接打开首页
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

## 专题列表

| 专题 | 题数 | 说明 |
|------|------|------|
| [🌐 跨域](./topics/cors.html) | 8 | CORS、预检、Cookie 跨域、开发代理 |
| [💾 浏览器缓存](./topics/cache.html) | 6 | 强缓存 / 协商缓存、构建产物策略 |
| [🔒 闭包](./topics/closure.html) | 15 | 循环坑、防抖节流、私有变量 |
| [⏳ Promise](./topics/promise.html) | 26 | 状态、链式、静态方法、async/await |
| [⚡ 异步并发](./topics/concurrency.html) | 10 | 限流 runPool、重试、AbortController |
| [🔄 事件循环](./topics/eventloop.html) | 10 | 宏/微任务、输出顺序、rAF |
| [📘 TypeScript](./topics/typescript.html) | 36 | 类型推断、泛型、工具类型 |
| [🔗 原型链 & 继承](./topics/prototype.html) | 12 | prototype、new、继承方式 |
| [🏹 箭头函数](./topics/arrow.html) | 25 | this、输出题（部分可运行） |

**合计 158 题。**

### 推荐刷题组合

**Async 三件套**（建议按顺序）：

```
Promise → 异步并发 → 事件循环
```

**JS 核心**：

```
闭包 → 原型链 → 箭头函数 → Promise 三件套
```

**浏览器 / 网络**：

```
跨域 → 浏览器缓存
```

## 项目结构

```
fe-interview-essentials/
├── index.html              # 首页 · 专题入口 & 进度总览
├── topics/                 # 各专题 HTML
│   ├── cors.html
│   ├── cache.html
│   ├── closure.html
│   ├── promise.html
│   ├── concurrency.html
│   ├── eventloop.html
│   ├── typescript.html
│   ├── prototype.html
│   └── arrow.html
└── assets/
    ├── css/style.css
    └── js/app.js           # 自测/复习模式、进度、代码运行
```

## 功能说明

| 功能 | 说明 |
|------|------|
| 精练路径 | 每专题顶部列出时间紧时必做的题 |
| 必练 / 选练 | 卡片 badge 标注优先级 |
| 实战场景 | 多数题目带 📌 业务场景，而不只是概念 |
| 进度持久化 | `localStorage` 键名 `fe-review-progress` |
| 运行代码 | 箭头函数、事件循环等专题支持页面内运行输出 |

## 技术栈

- HTML + CSS + 原生 JavaScript
- 无构建工具、无框架、无后端

## License

MIT
