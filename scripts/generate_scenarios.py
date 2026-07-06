#!/usr/bin/env python3
"""从场景题 PDF 目录 + 口述答案生成 topics/scenarios.html"""

import html as html_lib
import re
import sys
from pathlib import Path

import fitz

ROOT = Path(__file__).resolve().parent.parent
PDF1 = Path("/Users/admin/Documents/学习资料/前端复习资料/15【2】2025年前端最新场景题面试攻略.pdf")
OUT = ROOT / "topics" / "scenarios.html"

sys.path.insert(0, str(Path(__file__).resolve().parent))
from scenario_spoken_answers import SPOKEN_ANSWERS


def esc(s: str) -> str:
    return html_lib.escape(s)


def format_spoken_answer(points: list[str]) -> str:
    """将口述要点渲染为 HTML。"""
    if not points:
        return '<p class="muted">（暂无口述答案）</p>'

    parts = []
    oral = None
    body = []

    for p in points:
        if p.startswith("口述：") or p.startswith("口述:"):
            oral = p.lstrip("口述：").lstrip("口述:")
        else:
            body.append(p)

    if body:
        parts.append("<ul>")
        for item in body:
            parts.append(f"<li>{esc(item)}</li>")
        parts.append("</ul>")

    if oral:
        parts.append(f'<p><strong>口述参考：</strong>{esc(oral)}</p>')

    return "\n".join(parts)


def page_range_for_toc_item(toc, index, doc_len):
    """按目录计算每题对应的页码区间（处理多题共用起始页的情况）。"""
    page = toc[index][2]
    page_end = toc[index + 1][2] if index + 1 < len(toc) else doc_len + 1

    if page_end <= page:
        for j in range(index + 1, len(toc)):
            if toc[j][2] > page:
                page_end = toc[j][2]
                break
        else:
            page_end = doc_len + 1

    same_page_indices = [index]
    for j in range(index + 1, len(toc)):
        if toc[j][2] == page:
            same_page_indices.append(j)
        else:
            break

    group_size = len(same_page_indices)
    group_index = same_page_indices.index(index)
    total_pages = max(1, page_end - page)
    pages_per_q = max(1, total_pages // group_size)

    q_start = page + group_index * pages_per_q
    q_end = page + (group_index + 1) * pages_per_q if group_index < group_size - 1 else page_end
    return q_start, q_end


def build_questions():
    doc1 = fitz.open(str(PDF1))
    toc = doc1.get_toc()
    questions = []

    for i, (_level, title, page) in enumerate(toc):
        title = re.sub(r"\s+", " ", title.strip())
        if not re.match(r"^\d+\.", title):
            continue
        q_start, q_end = page_range_for_toc_item(toc, i, len(doc1))
        questions.append(
            {
                "num": int(re.match(r"^(\d+)\.", title).group(1)),
                "title": re.sub(r"^\d+\.\s*", "", title).strip(),
                "page_start": q_start,
                "page_end": q_end,
            }
        )

    for q in questions:
        q["content"] = SPOKEN_ANSWERS.get(q["num"], [])

    return questions


def render_html(questions: list) -> str:
    sections = [
        ("一、工程实践与代码质量", 1, 27),
        ("二、性能与架构", 28, 45),
        ("三、浏览器与网络", 46, 70),
        ("四、框架与工程化", 71, 95),
        ("五、安全、登录与权限", 96, 119),
        ("六、构建优化与高级专题", 120, 138),
    ]

    html_parts = []
    q_global = 0

    for sec_title, start, end in sections:
        cards = []
        for q in questions:
            if not (start <= q["num"] <= end):
                continue
            q_global += 1
            qid = f"q{q_global}"
            badge = (
                '<span class="badge badge-must">场景题</span>'
                if q["num"] <= 27
                else '<span class="badge badge-optional">场景题</span>'
            )
            title_clean = re.sub(r"【热度:[^\]]+】", "", q["title"]).strip()
            heat = re.search(r"【热度:\s*([^\]]+)】", q["title"])
            heat_note = f'<span class="meta">热度 {esc(heat.group(1))}</span>' if heat else ""
            origin = ""
            if q["num"] <= 27:
                origin = (
                    f'<div class="scenario"><div class="scenario-label">📌 原题编号</div>'
                    f'<p>PDF 题号 {q["num"]} · 第 {q["page_start"]} 页起</p></div>'
                )

            cards.append(
                f"""
        <article class="card" id="{qid}" data-qid="{qid}">
          <div class="card-header">
            {badge}
            <h3>Q{q_global} · {esc(title_clean)}</h3>
          </div>
          {origin}
          <details class="answer">
            <summary>查看答案</summary>
            <div class="answer-body">
              {format_spoken_answer(q["content"])}
            </div>
          </details>
          <div class="card-footer">
            <label><input type="checkbox" class="mastered-check" /> 已掌握</label>
            {heat_note}
          </div>
        </article>"""
            )

        html_parts.append(
            f"""
      <section class="section">
        <h2 class="section-title">{sec_title}</h2>
        {''.join(cards)}
      </section>"""
        )

    return f"""<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>场景题攻略 · FE Interview Essentials</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="../assets/css/style.css" />
  </head>
  <body data-topic="scenarios">
    <header class="site-header">
      <div class="inner">
        <a href="../index.html" class="logo">
          <div class="logo-icon">📚</div>
          <div>
            <div class="logo-text">FE Interview Essentials</div>
            <div class="logo-sub">前端面试复习</div>
          </div>
        </a>
        <div class="header-actions">
          <button class="btn" id="btn-test" type="button">📝 自测模式</button>
          <button class="btn btn-primary" id="btn-review" type="button">
            📖 复习模式
          </button>
        </div>
      </div>
    </header>

    <main class="container">
      <div class="page-header">
        <h1>🎯 2025 前端场景题面试攻略</h1>
        <p class="subtitle">整合两份 PDF · 共 {len(questions)} 题 · 口述版答案 · 点击展开</p>
      </div>

      <aside class="quick-path">
        <h2>📋 题目概览</h2>
        <p class="time">来源：《2025年前端最新场景题面试攻略》+ 扩展版（含 Q1–27 独家场景题）</p>
        <ol>
          <li><a href="#q1">Q1</a> 批量请求失败只弹一个 toast</li>
          <li><a href="#q28">Q28</a> 前端如何实现截图</li>
          <li><a href="#q55">Q55</a> 不用脚手架用 Webpack 构建 React</li>
          <li><a href="#q89">Q89</a> 一次性渲染十万条数据</li>
          <li><a href="#q118">Q118</a> Token 身份验证</li>
          <li><a href="#q138">Q138</a> 跨页面通信方式</li>
        </ol>
      </aside>
{''.join(html_parts)}
    </main>

    <script src="../assets/js/app.js"></script>
  </body>
</html>
"""


def main():
    questions = build_questions()
    html = render_html(questions)
    OUT.write_text(html, encoding="utf-8")
    print(f"Generated {OUT} with {len(questions)} questions ({len(html)} bytes)")


if __name__ == "__main__":
    main()
