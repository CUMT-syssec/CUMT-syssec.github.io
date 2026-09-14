"use client";

import { useEffect, useState } from "react";
import {
  culture,
  internshipOrgIds,
  organizations,
  outcomeCohorts,
  publications,
  site,
  teachers,
} from "@/lib/content";
import "./c.css";

/**
 * 方案 C — 终端原生 CONSOLE（灵感：pi.dev）
 * 整站即终端：开机自检、$ 命令分节、ASCII 表格、闪烁光标、Crooked Mode 彩蛋。
 */

const orgName = (id: string) =>
  organizations.find((o) => o.id === id)?.name ?? id;

/** 终端列宽对齐：CJK 全角字符按 2 列宽计算 */
const wc = (s: string) =>
  [...s].reduce(
    (n, ch) => n + (/[⺀-鿿豈-﫿　-〿＀-￯—·]/.test(ch) ? 2 : 1),
    0,
  );
const pad = (s: string, w: number) => s + " ".repeat(Math.max(0, w - wc(s)));

function asciiTable(rows: string[][]): string {
  const widths = rows[0].map((_, c) =>
    Math.max(...rows.map((r) => wc(r[c]))),
  );
  const border = `+-${widths.map((w) => "-".repeat(w)).join("-+-")}-+`;
  const line = (r: string[]) =>
    `| ${r.map((cell, c) => pad(cell, widths[c])).join(" | ")} |`;
  return [
    border,
    line(rows[0]),
    border,
    ...rows.slice(1).map(line),
    border,
  ].join("\n");
}

const BOOT_LINES = [
  "$ boot --lab cumt-syssec",
  "[ OK ] kernel ............ 系统安全与优化",
  "[ OK ] virt .............. 虚拟化",
  "[ OK ] cloud ............. 云计算安全",
  "[ OK ] agent ............. Agent 安全",
  "$ whoami",
];

function SectionHead({ cmd }: { cmd: string }) {
  return (
    <div className="vc-cmd">
      <span className="vc-prompt">guest@syssec</span>
      <span className="vc-colon">:</span>
      <span className="vc-tilde">~</span>
      <span className="vc-colon">$</span> {cmd}
    </div>
  );
}

export default function VariantC() {
  const [booted, setBooted] = useState(0);
  const [crooked, setCrooked] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (booted >= BOOT_LINES.length) return;
    const t = setTimeout(
      () => setBooted((v) => v + 1),
      booted === 0 ? 350 : 180,
    );
    return () => clearTimeout(t);
  }, [booted]);

  const ready = booted >= BOOT_LINES.length;

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* 剪贴板不可用时静默 */
    }
  };

  return (
    <main className={`vc${crooked ? " vc-crooked" : ""}`}>
      {/* 窗口栏 */}
      <header className="vc-top">
        <span className="vc-dots" aria-hidden>
          <i /> <i /> <i />
        </span>
        <span className="vc-title">guest@cumt-syssec: ~/lab — 80×24</span>
        <button
          className="vc-crook"
          onClick={() => setCrooked((v) => !v)}
          title="彩蛋：让页面歪一点"
        >
          {crooked ? "crooked mode: ON [revert]" : "crooked mode: OFF"}
        </button>
      </header>

      <div className="vc-body">
        {/* 开机序列 + 首屏 */}
        <section className="vc-hero">
          <pre className="vc-boot">
            {BOOT_LINES.slice(0, booted).map((l, i) => (
              <span key={i} className={l.startsWith("[ OK ]") ? "vc-ok" : ""}>
                {l}
                {"\n"}
              </span>
            ))}
          </pre>
          <div className={`vc-hero-in${ready ? " vc-ready" : ""}`}>
            <h1 className="vc-h1">
              <span className="vc-dim"># </span>系统安全实验室
              <span className="vc-cursor" aria-hidden />
            </h1>
            <p className="vc-sub">
              CUMT-SYSSEC · 中国矿业大学 计算机科学与技术学院/人工智能学院
            </p>
            <p className="vc-scrollhint">$ scroll to continue ▾</p>
          </div>
        </section>

        {/* team */}
        <section className="vc-sec">
          <SectionHead cmd="ls -la ./team" />
          <pre className="vc-ls">
            {teachers
              .map(
                (t) =>
                  `drwxr-xr-x  ${t.name.padEnd(4, "　")}  ${t.roles.join(" · ")}`,
              )
              .join("\n")}
          </pre>
          <div className="vc-cards">
            {teachers.map((t, i) => (
              <article className="vc-card" key={t.id}>
                <h3>
                  <span className="vc-dim">## </span>
                  {t.name}
                  <span className="vc-dim"> — {t.roles.join(" · ")}</span>
                </h3>
                <p className="vc-kv">
                  <span>directions:</span> {t.directions.join(", ")}
                </p>
                <p className="vc-bio">{t.bio}</p>
                {t.links[0] ? (
                  <a href={t.links[0].href} target="_blank" rel="noreferrer">
                    $ open {t.links[0].label} ↗
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        {/* outcomes */}
        <section className="vc-sec">
          <SectionHead cmd="./outcomes --by cohort" />
          <pre className="vc-table">
            {asciiTable([
              ["COHORT", "DESTINATIONS", "STAGE"],
              ...outcomeCohorts.map((c) => [
                String(c.cohort),
                c.orgIds.map(orgName).join(" · "),
                c.stage === "final" ? "final" : "current",
              ]),
              [
                "intern",
                internshipOrgIds.map(orgName).join(" · "),
                "industry",
              ],
            ])}
          </pre>
          <p className="vc-note">
            * 按毕业届别聚合到单位一级，不记名；本届为申请阶段信息，不计入统计。
          </p>
        </section>

        {/* publications */}
        <section className="vc-sec">
          <SectionHead cmd='grep -r "published" ./pubs' />
          <div className="vc-pubs">
            {publications.map((p, i) => (
              <article className="vc-pub" key={p.id}>
                <p className="vc-fig">
                  Fig. {String(i + 1).padStart(2, "0")} | {p.venue} | {p.year}
                  {p.badges?.length ? ` | ${p.badges.join(" · ")}` : ""}
                </p>
                <h3>{p.title}</h3>
                <p className="vc-authors">
                  {p.authors.map((a, j) => (
                    <span key={j} className={a.lab ? "vc-lab" : ""}>
                      {a.name}
                      {a.corresponding ? "*" : ""}
                      {j < p.authors.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </p>
                <div className="vc-links">
                  {p.links.map((l) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
                      [{l.label} ↗]
                    </a>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* culture */}
        <section className="vc-sec">
          <SectionHead cmd="cat culture.md" />
          <h2 className="vc-phrase">
            <span className="vc-dim"># </span>
            {culture.phrase}
          </h2>
          <p className="vc-note">{culture.sub}</p>
          <ul className="vc-rules">
            {culture.rules.map((r) => (
              <li key={r.title}>
                <strong>- {r.title}</strong>
                <p>{r.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* contact */}
        <section className="vc-sec">
          <SectionHead cmd={`mail -s "join" ${site.email}`} />
          <ul className="vc-aud">
            {site.audience.map((a) => (
              <li key={a}>&gt; {a}</li>
            ))}
          </ul>
          <div className="vc-mailrow">
            <code>{site.email}</code>
            <button onClick={copyEmail}>{copied ? "[copied ✓]" : "[copy]"}</button>
          </div>
        </section>

        <footer className="vc-foot">
          <span>© 2026 CUMT-SYSSEC · verified {site.lastVerified}</span>
          <span>
            {site.footerLinks.map((l, i) => (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
                [{l.label} ↗]{i < site.footerLinks.length - 1 ? " " : ""}
              </a>
            ))}
          </span>
          <span className="vc-dim">EOF —— and yes, it can play DOOM.</span>
        </footer>
      </div>

      <a className="vc-labback" href="/lab/">
        ← LAB
      </a>
    </main>
  );
}
