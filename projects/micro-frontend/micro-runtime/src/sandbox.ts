/**
 * JS 沙箱（SnapshotSandbox 简化版）
 *
 * 【解决什么问题】
 * 子应用如果直接写 window.xxx = 1，会污染主应用和其他子应用的全局环境。
 *
 * 【怎么做】
 * 用 Proxy 造一个「假 window」：
 * - 读：沙箱里没有的变量，回落到真 window（如 console、document）
 * - 写：只写进沙箱自己的 Map，不碰真 window
 *
 * 【举例】
 * 子应用执行：sandboxWindow.__SUB_APP__ = "dashboard"
 * → sandboxMap 变为 Map { "__SANDBOX_NAME__" => "dashboard", "__SUB_APP__" => "dashboard" }
 * → 真 window 上没有 __SUB_APP__
 *
 * 卸载时调用 inactive()，sandboxMap.clear()，子应用写的全局变量全部清空。
 */

export class SnapshotSandbox {
  /** 暴露给子应用的假 window 对象 */
  private proxyWindow: Window;

  /**
   * 沙箱内部的「全局变量表」
   * @example 挂载 dashboard 后可能为：
   * Map {
   *   "__SANDBOX_NAME__" => "dashboard",
   *   "__SUB_APP__" => "dashboard"
   * }
   */
  private sandboxMap = new Map<PropertyKey, unknown>();

  /** 是否已进入「允许写入沙箱」状态 */
  private modifying = false;

  /**
   * @param name 沙箱名称，用于调试，例如 "dashboard" | "settings"
   */
  constructor(name: string) {
    const rawWindow = window; // 浏览器真实的 window
    const fakeWindow = {} as Window; // 空对象，将被 Proxy 包装

    this.proxyWindow = new Proxy(fakeWindow, {
      /**
       * 读取属性时：
       * 1. 沙箱 Map 里有 → 返回沙箱自己的值
       * 2. 没有 → 从真 window 上读（如 document、setTimeout）
       */
      get: (_target, prop: PropertyKey) => {
        if (prop === Symbol.unscopables) return undefined;

        if (this.sandboxMap.has(prop)) {
          return this.sandboxMap.get(prop);
        }

        const value = (rawWindow as unknown as Record<PropertyKey, unknown>)[prop];
        // 函数要 bind 到真 window，否则 this 会丢
        if (typeof value === "function") {
          return value.bind(rawWindow);
        }
        return value;
      },

      /**
       * 写入属性时：只写进 sandboxMap，不写到真 window
       * @example sandboxWindow.foo = "bar" → sandboxMap.set("foo", "bar")
       */
      set: (_target, prop: PropertyKey, value: unknown) => {
        if (!this.modifying) {
          this.modifying = true;
        }
        this.sandboxMap.set(prop, value);
        return true;
      },

      /** 支持 "xxx" in sandboxWindow 判断 */
      has: (_target, prop) => {
        return this.sandboxMap.has(prop) || prop in rawWindow;
      },
    });

    // 内置调试标记，getPatchCount() 会统计到
    this.sandboxMap.set("__SANDBOX_NAME__", name);
  }

  /** 子应用通过 props.sandboxWindow 拿到的就是这个假 window */
  get window(): Window {
    return this.proxyWindow;
  }

  /** 激活沙箱，子应用 mount 前调用 */
  active(): void {
    this.modifying = true;
  }

  /**
   * 卸载沙箱：清空子应用写入的全局变量
   * @example inactive 后 sandboxMap.size === 0
   */
  inactive(): void {
    this.sandboxMap.clear();
    this.modifying = false;
  }

  /**
   * 当前沙箱里有多少个「被改写/新增」的全局变量
   * @example 刚 mount dashboard 后可能返回 2（__SANDBOX_NAME__ + __SUB_APP__）
   */
  getPatchCount(): number {
    return this.sandboxMap.size;
  }
}
