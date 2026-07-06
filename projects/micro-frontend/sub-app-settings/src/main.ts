/**
 * 子应用：设置中心（settings）
 *
 * 结构和 dashboard 类似，演示第二个子应用的接入方式。
 * 主应用 entry: "http://localhost:7102/"
 * 全局键名: window.__MICRO_APP_settings__
 */

import "./style.css";

interface MountProps {
  name: string; // 例如 "settings"
  container: HTMLElement;
  sandboxWindow: Window;
  data?: Record<string, unknown>;
}

export const APP_NAME = "settings";

let root: HTMLElement | null = null;

function render(host: HTMLElement) {
  host.innerHTML = `
    <div class="subapp subapp-settings">
      <header>
        <h2>⚙️ 子应用：设置中心</h2>
        <span class="tag">独立端口 7102</span>
      </header>
      <form class="form">
        <label>主题模式
          <select>
            <option>跟随系统</option>
            <option>浅色</option>
            <option>深色</option>
          </select>
        </label>
        <label>通知开关
          <input type="checkbox" checked />
        </label>
        <label>语言
          <select>
            <option>简体中文</option>
            <option>English</option>
          </select>
        </label>
      </form>
      <p class="note">这个子应用有自己的样式作用域，卸载时会移除动态加载的 CSS。</p>
    </div>
  `;
}

export async function bootstrap() {
  console.info(`[${APP_NAME}] bootstrap`);
}

export async function mount(props: MountProps) {
  root = document.createElement("div");
  props.container.appendChild(root);
  render(root);

  // 同样演示沙箱写入：sandboxWindow.__SUB_APP__ === "settings"
  (props.sandboxWindow as unknown as Record<string, string>).__SUB_APP__ = APP_NAME;
}

export async function unmount(props: MountProps) {
  props.container.innerHTML = "";
  root = null;
}

const globalKey = `__MICRO_APP_${APP_NAME}__`; // "__MICRO_APP_settings__"
(window as unknown as Record<string, object>)[globalKey] = {
  bootstrap,
  mount,
  unmount,
};

/** 仅在 localhost:7102 独立打开时自启动，被主应用加载时不执行 */
function isStandalone(): boolean {
  const powered = (window as unknown as { __POWERED_BY_MICRO__?: boolean }).__POWERED_BY_MICRO__;
  return !powered && window.location.port === "7102";
}

if (isStandalone()) {
  const el = document.querySelector<HTMLDivElement>("#app");
  if (el) {
    mount({ name: APP_NAME, container: el, sandboxWindow: window });
  }
}
