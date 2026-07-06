# projects · 独立小项目

每个子文件夹是一个**完全独立**的学习/实验项目：

- 有自己的 `package.json` 和 `node_modules`
- 独立安装依赖、独立启动，不影响仓库其他部分
- 与 `topics/` 静态复习站、`assets/` 等资源互不干扰

## 已有项目

| 目录 | 说明 | 启动 |
|------|------|------|
| [micro-frontend](./micro-frontend/) | 微前端实现原理（手写 runtime + 主/子应用） | `cd micro-frontend && npm install && npm run dev` |

## 新增项目约定

后续新专题在 `projects/<名称>/` 下新建文件夹即可，建议包含：

- `README.md` — 原理说明与启动方式
- `package.json` — 独立依赖
- `.gitignore` — 至少忽略 `node_modules/`、`dist/`
