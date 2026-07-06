import type { MicroAppLifecycle } from "./types.js";

/**
 * 给动态插入的 link/script 打标，卸载时按子应用名批量删除
 * @example <link data-micro-app="dashboard" href="http://localhost:7101/src/style.css">
 */
const STYLE_ATTR = "data-micro-app";

/**
 * 从子应用入口加载资源并拿到生命周期对象
 *
 * 【流程】
 * 1. fetch(entry) 拿到 HTML 字符串
 * 2. 正则解析出 <script src> 和 <link rel="stylesheet">
 * 3. 动态插入页面执行
 * 4. 从 window.__MICRO_APP_${name}__ 取出 { bootstrap, mount, unmount }
 *
 * 【真实 qiankun】
 * 这步对应 import-html-entry 包，本文件是教学简化版。
 *
 * @param entry 例如 "http://localhost:7101/"
 * @param appName 例如 "dashboard"
 * @returns 例如 { bootstrap: [AsyncFunction], mount: [AsyncFunction], unmount: [AsyncFunction] }
 */
export async function loadAppFromEntry(
  entry: string,
  appName: string
): Promise<MicroAppLifecycle> {
  // html 示例：<!DOCTYPE html>...<script type="module" src="/src/main.ts"></script>
  const html = await fetch(entry).then((r) => {
    if (!r.ok) throw new Error(`加载子应用 ${appName} 失败: ${entry}`);
    return r.text();
  });

  const { scripts, styles } = parseEntryHtml(html, entry);

  console.log("scripts", scripts);  
  console.log("styles", styles);

  // styles 示例：[]（Vite 开发模式 CSS 通常随 JS import 注入，这里 link 可能为空）
  await loadStyles(styles, appName);

  // 标记「正在被微前端主应用加载」，防止子应用脚本误走独立运行逻辑
  // （否则子应用会去 document.querySelector("#app") 挂到主应用根节点底部）
  (window as unknown as { __POWERED_BY_MICRO__?: boolean }).__POWERED_BY_MICRO__ = true;

  // scripts 示例：["http://localhost:7101/src/main.ts"]
  await execScripts(scripts, appName);

  // 子应用在 main.ts 末尾会挂：window.__MICRO_APP_dashboard__ = { bootstrap, mount, unmount }
  const globalKey = `__MICRO_APP_${appName}__`;
  const lifecycle = (window as unknown as Record<string, MicroAppLifecycle>)[globalKey];

  if (!lifecycle?.mount) {
    throw new Error(
      `子应用 ${appName} 未导出生命周期，请确认 window.${globalKey} 存在`
    );
  }

  return lifecycle;
}

/**
 * 解析入口 HTML，提取脚本和样式 URL
 *
 * @param html 子应用 index.html 的文本内容
 * @param entry 例如 "http://localhost:7101/"，用于把相对路径转成绝对路径
 * @returns 例如 { scripts: ["http://localhost:7101/src/main.ts"], styles: [] }
 */
function parseEntryHtml(html: string, entry: string) {
  const base = new URL(entry);
  const scripts: string[] = [];
  const styles: string[] = [];

  const scriptRe = /<script[^>]+src=["']([^"']+)["'][^>]*>\s*<\/script>/gi;
  const styleRe = /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["'][^>]*>/gi;

  let m: RegExpExecArray | null;
  while ((m = scriptRe.exec(html))) {
    const url = new URL(m[1], base).href;
    // Vite 热更新客户端只在子应用独立打开时需要，主应用加载时跳过
    // 例如跳过 "http://localhost:7101/@vite/client"
    if (url.includes("@vite/client")) continue;
    scripts.push(url);
  }
  while ((m = styleRe.exec(html))) {
    styles.push(new URL(m[1], base).href);
  }

  return { scripts, styles };
}

/** 把子应用样式以 <link> 形式插入 <head>，并打上 data-micro-app 标记 */
async function loadStyles(urls: string[], appName: string) {
  for (const href of urls) {
    // 避免重复插入同一条样式
    if (document.querySelector(`link[${STYLE_ATTR}="${appName}"][href="${href}"]`)) {
      continue;
    }
    await new Promise<void>((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href; // 例如 "http://localhost:7101/src/style.css"
      link.setAttribute(STYLE_ATTR, appName); // 例如 data-micro-app="dashboard"
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`样式加载失败: ${href}`));
      document.head.appendChild(link);
    });
  }
}

/** 移除某个子应用插入的所有 <link> 样式 */
function removeStyles(appName: string) {
  document.querySelectorAll(`link[${STYLE_ATTR}="${appName}"]`).forEach((el) => el.remove());
}

/** 卸载时按子应用名清理样式（export 给 runtime 用） */
export function unloadStyles(appName: string) {
  removeStyles(appName);
}

/**
 * 动态创建 <script type="module"> 执行子应用代码
 * 脚本执行完后，window.__MICRO_APP_xxx__ 上就有生命周期对象了
 */
async function execScripts(urls: string[], appName: string) {
  for (const src of urls) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src; // 例如 "http://localhost:7101/src/main.ts"
      script.type = "module";
      script.setAttribute(STYLE_ATTR, appName);
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`脚本加载失败: ${src}`));
      document.body.appendChild(script);
    });
  }
}

/** 按标记移除 script 标签（当前 runtime 未在卸载时调用，生命周期缓存在内存里） */
export function unloadScripts(appName: string) {
  document.querySelectorAll(`script[${STYLE_ATTR}="${appName}"]`).forEach((el) => el.remove());
}
