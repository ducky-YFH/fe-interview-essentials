/**
 * 微前端类型定义
 *
 * 类比：主应用像「商场」，子应用像「入驻店铺」。
 * 双方通过下面这套接口约定怎么开业（bootstrap）、营业（mount）、撤场（unmount）。
 */

/** 子应用必须实现的生命周期钩子（和 qiankun / single-spa 一致） */
export interface MicroAppLifecycle {
  /** 可选。整个子应用生命周期内只执行一次，适合做一次性初始化 */
  bootstrap?: () => Promise<void> | void;
  /** 必须。把子应用界面渲染到主应用给的容器里 */
  mount: (props: MountProps) => Promise<void> | void;
  /** 必须。切换走或卸载时清理 DOM、事件监听等 */
  unmount: (props: MountProps) => Promise<void> | void;
}

/**
 * mount / unmount 时主应用传给子应用的参数
 *
 * @example
 * {
 *   name: "dashboard",
 *   container: <div id="subapp-container">...</div>,
 *   sandboxWindow: Proxy { ... },  // 沙箱假 window，不是真 window
 *   data: { userId: "u001" }       // 可选，主应用下发的共享数据
 * }
 */
export interface MountProps {
  /** 子应用名称，例如 "dashboard" | "settings" */
  name: string;
  /** 主应用提供的 DOM 挂载点，子应用把自己的 UI 插进这个节点 */
  container: HTMLElement;
  /** 沙箱 window：子应用往上面挂全局变量，不会污染主应用的真 window */
  sandboxWindow: Window;
  /** 主应用可选下发的数据 */
  data?: Record<string, unknown>;
}

/**
 * 注册子应用时的配置项
 *
 * @example
 * {
 *   name: "dashboard",
 *   entry: "http://localhost:7101/",
 *   activeWhen: (loc) => loc.hash.startsWith("#/dashboard"),
 *   container: "#subapp-container"
 * }
 */
export interface MicroAppConfig {
  /** 唯一标识，例如 "dashboard"、"settings" */
  name: string;
  /** 子应用入口 HTML 地址。运行时 fetch 这个地址，解析其中的 script/link */
  entry: string;
  /**
   * 路由激活规则：返回 true 时加载该子应用
   * @example activeWhen: (loc) => loc.hash === "#/dashboard"
   */
  activeWhen: (location: Location) => boolean;
  /** 挂载容器 CSS 选择器，默认 "#subapp-container" */
  container?: string;
}

/** 内部记录：某个子应用是否已加载、是否正在挂载（本 demo 中部分逻辑已改用 lifecycleCache） */
export interface LoadedApp {
  config: MicroAppConfig;
  lifecycle?: MicroAppLifecycle;
  /** 例如 true 表示当前正显示在页面上 */
  mounted: boolean;
}
