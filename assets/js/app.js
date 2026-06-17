/**
 * FE Interview Essentials — 全局交互
 * · 自测 / 复习模式（全部折叠 / 展开答案）
 * · localStorage 记录「已掌握」
 * · 首页进度条同步
 */

const STORAGE_KEY = 'fe-review-progress';

function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveProgress(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function initTopicPage() {
  const topicId = document.body.dataset.topic;
  if (!topicId) return;

  const progress = getProgress();
  if (!progress[topicId]) progress[topicId] = {};

  document.querySelectorAll('.card[data-qid]').forEach((card) => {
    const qid = card.dataset.qid;
    const checkbox = card.querySelector('.mastered-check');

    if (progress[topicId][qid]) {
      checkbox.checked = true;
      card.classList.add('mastered');
    }

    checkbox.addEventListener('change', () => {
      progress[topicId][qid] = checkbox.checked;
      card.classList.toggle('mastered', checkbox.checked);
      saveProgress(progress);
    });
  });

  document.getElementById('btn-test')?.addEventListener('click', () => {
    document.querySelectorAll('.answer').forEach((el) => (el.open = false));
  });

  document.getElementById('btn-review')?.addEventListener('click', () => {
    document.querySelectorAll('.answer').forEach((el) => (el.open = true));
  });
}

function initIndexPage() {
  const progress = getProgress();

  document.querySelectorAll('.topic-card[data-topic]').forEach((card) => {
    const topicId = card.dataset.topic;
    const total = parseInt(card.dataset.total, 10) || 0;
    const topicProgress = progress[topicId] || {};
    const done = Object.values(topicProgress).filter(Boolean).length;
    const pct = total ? Math.round((done / total) * 100) : 0;

    const fill = card.querySelector('.progress-fill');
    const text = card.querySelector('.progress-text');
    if (fill) fill.style.width = `${pct}%`;
    if (text) text.textContent = total ? `${done} / ${total} 已掌握` : '即将上线';
  });
}

function runCode(btn) {
  const card = btn.closest('.card');
  const codeEl = card?.querySelector('code[data-runnable]');
  const outputEl = card?.querySelector('.run-output');
  if (!codeEl || !outputEl) return;

  const logs = [];
  const fakeConsole = {
    log: (...args) => logs.push(args.map(String).join(' ')),
  };

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function('console', codeEl.textContent);
    fn(fakeConsole);
    outputEl.textContent = logs.length ? logs.join('\n') : '(无输出)';
    outputEl.classList.add('visible');
  } catch (e) {
    outputEl.textContent = `Error: ${e.message}`;
    outputEl.classList.add('visible');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initTopicPage();
  initIndexPage();

  document.querySelectorAll('[data-run]').forEach((btn) => {
    btn.addEventListener('click', () => runCode(btn));
  });
});
