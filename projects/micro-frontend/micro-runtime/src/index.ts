/**
 * 微前端运行时入口（本项目的「迷你 qiankun」）
 *
 * 主应用用法：
 *   const runtime = createMicroFrontendRuntime();
 *   runtime.registerMicroApps([...]);
 *   runtime.start();
 */

import { loadAppFromEntry, unloadStyles } from "./loader.js";
import { SnapshotSandbox } from "./sandbox.js";
import type { MicroAppConfig, MicroAppLifecycle, MountProps } from "./types.js";

export type { MicroAppConfig, MicroAppLifecycle, MountProps } from "./types.js";

export class MicroFrontendRuntime {
  /**
   * 已注册的子应用列表
   * @example [
   *   { name: "dashboard", entry: "http://localhost:7101/", activeWhen: (loc) => loc.hash.startsWith("#/dashboard") },
   *   { name: "settings", entry: "http://localhost:7102/", activeWhen: (loc) => loc.hash.startsWith("#/settings") }
   * ]
   */
  private apps: MicroAppConfig[] = [];

  /**
   * 生命周期缓存：每个子应用只 fetch + 执行脚本一次
   * @example Map { "dashboard" => { bootstrap, mount, unmount }, "settings" => {...} }
   */
  private lifecycleCache = new Map<string, MicroAppLifecycle>();

  /**
   * 记录哪些子应用已经跑过 bootstrap（bootstrap 全局只执行一次）
   * @example Set { "dashboard", "settings" }
   */
  private bootstrapped = new Set<string>();

  /** 当前正在显示的子应用名，例如 "dashboard"；没有则为 null */
  private currentName: string | null = null;

  /** 当前激活的 JS 沙箱实例，切换子应用时会重建 */
  private sandbox: SnapshotSandbox | null = null;

  /** 防止 start() 被重复调用 */
  private started = false;

  /** 子应用默认挂载到这个选择器对应的 DOM 节点 */
  private defaultContainer = "#subapp-container";

  /**
   * 注册子应用（类似 qiankun 的 registerMicroApps）
   * @param apps 子应用配置数组
   */
  registerMicroApps(apps: MicroAppConfig[]) {
    this.apps = apps;
  }

  /**
   * 启动微前端：监听 hash 路由变化，自动 mount/unmount
   * 本 demo 用 hash 路由，例如 #/dashboard、#/settings
   */
  start() {
    if (this.started) return;
    this.started = true;

    const run = () => this.syncRoute();
    window.addEventListener("hashchange", run); // 用户点击导航 #/settings 时触发
    run(); // 首次进入页面也执行一次
  }

  /**
   * 根据当前 URL 找到应该激活的子应用
   * @example location.hash === "#/dashboard" → 返回 dashboard 那条配置
   */
  private getActiveApp(): MicroAppConfig | undefined {
    return this.apps.find((app) => app.activeWhen(window.location));
  }

  /**
   * 路由同步：该挂谁、该卸谁
   *
   * 场景举例：
   * - 从 #/dashboard 切到 #/settings
   *   → currentName 从 "dashboard" 变 "settings"
   *   → 先 unmountApp("dashboard")，再 mountApp(settings配置)
   */
  private async syncRoute() {
    const active = this.getActiveApp();

    // 路由没变就不重复挂载，例如连续触发两次 hashchange
    if (active?.name === this.currentName) return;

    // 先卸载上一个子应用
    if (this.currentName) {
      await this.unmountApp(this.currentName);
    }

    if (active) {
      await this.mountApp(active);
      this.currentName = active.name; // 例如 "settings"
    } else {
      this.currentName = null;
      this.renderPlaceholder("请从顶部导航选择一个子应用");
    }
  }

  /**
   * 挂载子应用到容器
   * @param config 例如 { name: "dashboard", entry: "http://localhost:7101/", ... }
   */
  private async mountApp(config: MicroAppConfig) {
    // 第一次访问：fetch HTML → 执行脚本 → 缓存 lifecycle
    // 再次访问：直接用缓存，不再重复 fetch
    let lifecycle = this.lifecycleCache.get(config.name);

    if (!lifecycle) {
      lifecycle = await loadAppFromEntry(config.entry, config.name);
      this.lifecycleCache.set(config.name, lifecycle);
    }

    const container = document.querySelector(
      config.container ?? this.defaultContainer
    ) as HTMLElement | null;

    if (!container) {
      throw new Error(`找不到挂载容器: ${config.container ?? this.defaultContainer}`);
    }

    container.innerHTML = ""; // 清空旧内容，准备渲染新子应用

    // 每次 mount 都新建沙箱，保证 JS 隔离
    this.sandbox?.inactive();
    this.sandbox = new SnapshotSandbox(config.name);
    this.sandbox.active();

    const props: MountProps = {
      name: config.name, // "dashboard"
      container, // <div id="subapp-container">
      sandboxWindow: this.sandbox.window, // Proxy 假 window
    };

    // bootstrap 只执行一次；mount 每次切换都会执行
    if (!this.bootstrapped.has(config.name)) {
      await lifecycle?.bootstrap?.();
      this.bootstrapped.add(config.name);
    }
    await lifecycle?.mount(props);

    this.log(`已挂载子应用: ${config.name}（沙箱变量数: ${this.sandbox.getPatchCount()}）`);
  }

  /**
   * 卸载子应用
   * @param name 例如 "dashboard"
   */
  private async unmountApp(name: string) {
    const lifecycle = this.lifecycleCache.get(name);
    if (!lifecycle) return;

    const config = this.apps.find((a) => a.name === name);
    const container = document.querySelector(
      config?.container ?? this.defaultContainer
    ) as HTMLElement | null;

    if (container) {
      await lifecycle.unmount({ name, container, sandboxWindow: window });
      container.innerHTML = "";
    }

    this.sandbox?.inactive();
    this.sandbox = null;

    unloadStyles(name); // 移除该子应用的 <link> 样式

    this.log(`已卸载子应用: ${name}`);
  }

  /**
   * 主应用向子应用广播数据（子应用监听 micro-app:data 事件）
   * @param data 例如 { from: "main-app", at: 1710000000000 }
   */
  setGlobalData(data: Record<string, unknown>) {
    window.dispatchEvent(
      new CustomEvent("micro-app:data", { detail: data })
    );
  }

  /** 没有匹配路由时显示占位文案 */
  private renderPlaceholder(text: string) {
    const container = document.querySelector(this.defaultContainer);
    if (container) {
      container.innerHTML = `<div class="micro-placeholder">${text}</div>`;
    }
  }

  /**
   * 打日志：控制台 + 派发自定义事件给主应用 UI 显示
   * @param message 例如 "已挂载子应用: dashboard（沙箱变量数: 2）"
   */
  private log(message: string) {
    window.dispatchEvent(
      new CustomEvent("micro-app:log", { detail: message })
    );
    console.info(`[micro-runtime] ${message}`);
  }
}

/** 工厂函数，主应用里 const runtime = createMicroFrontendRuntime() */
export function createMicroFrontendRuntime() {
  return new MicroFrontendRuntime();
}
