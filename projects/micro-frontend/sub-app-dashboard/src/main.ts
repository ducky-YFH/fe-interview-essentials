/**
 * 子应用：仪表盘（dashboard）
 *
 * 【两种运行模式】
 * 1. 独立运行：直接打开 http://localhost:7101，自己 mount 到 #app
 * 2. 微前端模式：被主应用 fetch 入口 HTML，执行本文件，挂到 window.__MICRO_APP_dashboard__
 *
 * 【生命周期】
 * bootstrap → mount → unmount（和 qiankun 一致）
 */

import "./style.css";

/** 主应用 mount/unmount 时传入的参数（与 micro-runtime 的 MountProps 一致） */
interface MountProps {
  name: string; // 例如 "dashboard"
  container: HTMLElement; // 主应用的 #subapp-container
  sandboxWindow: Window; // 沙箱假 window
  data?: Record<string, unknown>;
}

/** 子应用唯一名，必须和主应用 registerMicroApps 里的 name 一致 */
export const APP_NAME = "dashboard";

/** 子应用 UI 的根 DOM 节点引用，unmount 时置 null */
let root: HTMLElement | null = null;

/** 主应用广播数据的监听器，unmount 时要移除 */
let dataHandler: ((e: Event) => void) | null = null;

/**
 * 渲染仪表盘 UI
 * @param host 挂载点，例如 <div>（会被 append 到 container 里）
 */
function render(host: HTMLElement) {
  host.innerHTML = `
    <div class="subapp subapp-dashboard">
      <header>
        <h2>📊 子应用：仪表盘</h2>
        <span class="tag">独立端口 7101 · 可被主应用加载</span>
      </header>
      <div class="cards">
        <article class="card"><strong>今日访问</strong><p>12,480</p></article>
        <article class="card"><strong>转化率</strong><p>3.6%</p></article>
        <article class="card"><strong>接口 P95</strong><p>186ms</p></article>
      </div>
      <p class="note" id="data-note">等待主应用下发数据…</p>
    </div>
  `;
}

/**
 * 首次加载子应用时执行一次（整个应用生命周期内只跑一次）
 * 适合做：拉配置、初始化 SDK 等
 */
export async function bootstrap() {
  console.info(`[${APP_NAME}] bootstrap`);
}

/**
 * 每次路由切到本应用时执行：把 UI 画进主应用给的容器
 * @param props 例如 { name: "dashboard", container: div#subapp-container, sandboxWindow: Proxy }
 */
export async function mount(props: MountProps) {
  root = document.createElement("div");
  props.container.appendChild(root);
  render(root);

  // 监听主应用 setGlobalData 发来的数据
  // detail 示例：{ from: "main-app", at: 1710000000123 }
  dataHandler = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    const note = root?.querySelector("#data-note");
    if (note) {
      note.textContent = `收到主应用数据: ${JSON.stringify(detail)}`;
    }
  };
  window.addEventListener("micro-app:data", dataHandler);

  // 演示沙箱：写到 sandboxWindow 上，不会出现在真 window
  // 真 window.__SUB_APP__ === undefined，沙箱里 __SUB_APP__ === "dashboard"
  (props.sandboxWindow as unknown as Record<string, string>).__SUB_APP__ = APP_NAME;
}

/**
 * 切走或卸载时：清 DOM、解绑事件
 */
export async function unmount(props: MountProps) {
  if (dataHandler) {
    window.removeEventListener("micro-app:data", dataHandler);
    dataHandler = null;
  }
  props.container.innerHTML = "";
  root = null;
}

/**
 * 暴露给 runtime 的生命周期对象
 * loader 执行完本脚本后，会读 window.__MICRO_APP_dashboard__
 */
const globalKey = `__MICRO_APP_${APP_NAME}__`; // "__MICRO_APP_dashboard__"
(window as unknown as Record<string, object>)[globalKey] = {
  bootstrap,
  mount,
  unmount,
};

/**
 * 是否独立运行（直接打开子应用自己的端口）
 * 必须同时满足：未被微前端加载 + 当前端口是本应用端口
 * 例如 dashboard 只在 localhost:7101 时独立运行
 */
function isStandalone(): boolean {
  const powered = (window as unknown as { __POWERED_BY_MICRO__?: boolean }).__POWERED_BY_MICRO__;
  console.log("powered", powered);
  return !powered && window.location.port === "7101";
}

/**
 * 独立运行模式：直接打开 http://localhost:7101 时，mount 到自己的 #app
 */
if (isStandalone()) {
  const el = document.querySelector<HTMLDivElement>("#app");
  if (el) {
    mount({ name: APP_NAME, container: el, sandboxWindow: window });
  }
}
