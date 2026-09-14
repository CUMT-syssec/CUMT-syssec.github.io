"use client";

import React, { useEffect, useRef, useState } from "react";
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
 * 方案 C — 终端叙事（蓝本：pi.dev）
 * 首屏：终端窗口打字输出 CUMT-SYSSEC 横幅。
 * 叙事区：左栏 sticky 终端，右栏每屏一个大标题；
 * 滚到哪个标题，终端就重新 cat 对应的 Markdown，输出区整块可点击。
 * 配色：pi.dev 暖纸 + 墨青 + 锈红。
 */

const orgName = (id: string) =>
  organizations.find((o) => o.id === id)?.name ?? id;

/* figlet "ANSI Shadow" 生成的 CUMT-SYSSEC 横幅 */
const BANNER = String.raw`
 ██████╗██╗   ██╗███╗   ███╗████████╗   ███████╗██╗   ██╗███████╗███████╗███████╗ ██████╗
██╔════╝██║   ██║████╗ ████║╚══██╔══╝   ██╔════╝╚██╗ ██╔╝██╔════╝██╔════╝██╔════╝██╔════╝
██║     ██║   ██║██╔████╔██║   ██║█████╗███████╗ ╚████╔╝ ███████╗███████╗█████╗  ██║     
██║     ██║   ██║██║╚██╔╝██║   ██║╚════╝╚════██║  ╚██╔╝  ╚════██║╚════██║██╔══╝  ██║     
╚██████╗╚██████╔╝██║ ╚═╝ ██║   ██║      ███████║   ██║   ███████║███████║███████╗╚██████╗
 ╚═════╝ ╚═════╝ ╚═╝     ╚═╝   ╚═╝      ╚══════╝   ╚═╝   ╚══════╝╚══════╝╚══════╝ ╚═════╝`
  .split("\n")
  .slice(1);

/** 终端列宽对齐：CJK 全角按 2 列 */
const wc = (s: string) =>
  [...s].reduce((n, ch) => n + (/[⺀-鿿豈-﫿　-〿＀-￯—·]/.test(ch) ? 2 : 1), 0);
const pad = (s: string, w: number) => s + " ".repeat(Math.max(0, w - wc(s)));

function asciiTable(rows: string[][]): string[] {
  const widths = rows[0].map((_, c) => Math.max(...rows.map((r) => wc(r[c]))));
  const border = `+-${widths.map((w) => "-".repeat(w)).join("-+-")}-+`;
  const line = (r: string[]) =>
    `| ${r.map((cell, c) => pad(cell, widths[c])).join(" | ")} |`;
  return [border, line(rows[0]), border, ...rows.slice(1).map(line), border];
}

/* ---------- 终端窗口：打字引擎 ---------- */

type TermLine = { node: React.ReactNode; cls?: string };

function Terminal({
  tab,
  cmd,
  lines,
  playKey,
  staticMode = false,
}: {
  tab: string;
  cmd: string;
  lines: TermLine[];
  playKey: number;
  staticMode?: boolean;
}) {
  const [cmdLen, setCmdLen] = useState(staticMode ? cmd.length : 0);
  const [shown, setShown] = useState(staticMode ? lines.length : 0);
  const [prevKey, setPrevKey] = useState(playKey);
  const bodyRef = useRef<HTMLDivElement>(null);

  // playKey 变化时同步复位（渲染期派生状态，避免闪旧内容）
  if (playKey !== prevKey) {
    setPrevKey(playKey);
    setCmdLen(staticMode ? cmd.length : 0);
    setShown(staticMode ? lines.length : 0);
  }

  useEffect(() => {
    if (staticMode || playKey <= 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCmdLen(cmd.length);
      setShown(lines.length);
      return;
    }
    const timers: number[] = [];
    let i = 0;
    const typeCmd = () => {
      i += 1;
      setCmdLen(Math.min(i, cmd.length));
      if (i < cmd.length) {
        timers.push(window.setTimeout(typeCmd, 20));
      } else {
        let j = 0;
        const showLine = () => {
          j += 1;
          setShown(j);
          if (j < lines.length) timers.push(window.setTimeout(showLine, 52));
        };
        timers.push(window.setTimeout(showLine, 140));
      }
    };
    timers.push(window.setTimeout(typeCmd, 300));
    return () => timers.forEach((t) => clearTimeout(t));
    // cmd/lines 与 playKey 同源，key 变即重放
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playKey, staticMode]);

  // 动画终端输出时保持滚动到底部；静态终端（移动端内嵌）不滚动，从头展示
  useEffect(() => {
    if (staticMode) return;
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [cmdLen, shown, staticMode]);

  const typing = cmdLen < cmd.length;
  const done = !typing && shown >= lines.length;

  return (
    <div className="vc2-term">
      <div className="vc2-term-head">
        <span className="vc2-term-tab">
          GUEST — {tab} <i />
        </span>
        <span className="vc2-term-size">80×24</span>
      </div>
      <div className="vc2-term-body" ref={bodyRef}>
        <div className="vc2-l vc2-cmdline">
          <span className="vc2-prompt">guest@syssec</span>
          <span className="vc2-dim">:</span>
          <span className="vc2-path">~</span>
          <span className="vc2-dim">$</span> {cmd.slice(0, cmdLen)}
          {typing ? <span className="vc2-caret" /> : null}
        </div>
        {lines.slice(0, shown).map((l, idx) => (
          <div key={idx} className={`vc2-l${l.cls ? ` ${l.cls}` : ""}`}>
            {l.node}
          </div>
        ))}
        {done ? (
          <div className="vc2-l vc2-cmdline">
            <span className="vc2-prompt">guest@syssec</span>
            <span className="vc2-dim">:</span>
            <span className="vc2-path">~</span>
            <span className="vc2-dim">$</span> <span className="vc2-caret vc2-caret-blink" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ---------- 首屏 ---------- */

function HeroTerminal() {
  const [playKey, setPlayKey] = useState(0);
  useEffect(() => setPlayKey(1), []);

  const lines: TermLine[] = [
    ...site.directions.map((d, i) => ({
      node: (
        <>
          <span className="vc2-ok">[ OK ]</span>{" "}
          {["kernel", "virt", "cloud", "agent"][i]}
          {" ………… "}
          {d}
        </>
      ),
    })),
    { node: " " },
    ...BANNER.map((b) => ({ node: b, cls: "vc2-banner" })),
    { node: " " },
    {
      node: (
        <span className="vc2-bright">
          {site.brand} —— {site.zhName}
        </span>
      ),
    },
    { node: <span className="vc2-dim">{site.affiliation}</span> },
    { node: " " },
    {
      node: (
        <a className="vc2-scrollhint" href="#story">
          $ scroll to continue ▾
        </a>
      ),
    },
  ];

  return (
    <section className="vc2-hero">
      <div className="vc2-hero-in">
        <Terminal tab="BOOT" cmd="boot --lab cumt-syssec" lines={lines} playKey={playKey} />
      </div>
    </section>
  );
}

/* ---------- 叙事区数据 ---------- */

type Section = {
  id: string;
  no: string;
  tab: string;
  kicker: string;
  title: React.ReactNode;
  body: React.ReactNode;
  cmd: string;
  lines: TermLine[];
};

function buildSections(copied: boolean, copyEmail: () => void): Section[] {
  return [
    {
      id: "s-team",
      no: "01",
      tab: "TEAM",
      kicker: "01 / TEAM — 人员",
      title: "认识做研究的人。",
      body: "五位教师，方向从内核完整性、虚拟化到量子密码与联邦学习。左边终端里每一整块都是链接，点进去是他们的官方主页。",
      cmd: "cat 01-team.md",
      lines: teachers.flatMap((t) => [
        {
          node: (
            <a className="vc2-tblock" href={t.links[0]?.href} target="_blank" rel="noreferrer">
              <span className="vc2-l">
                <span className="vc2-rust">## </span>
                <span className="vc2-bright">{t.name}</span>
                <span className="vc2-dim"> —— {t.roles.join(" · ")}</span>
              </span>
              <span className="vc2-l vc2-indent vc2-dim">
                方向：{t.directions.join("、")}
              </span>
              <span className="vc2-l vc2-indent">{t.bio}</span>
              <span className="vc2-l vc2-indent vc2-linkline">→ 教师主页 ↗</span>
            </a>
          ),
        },
      ]),
    },
    {
      id: "s-paths",
      no: "02",
      tab: "PATHS",
      kicker: "02 / PATHS — 去向",
      title: "学生去了哪里。",
      body: "按毕业届别公开到单位一级，不记名、无人数——这是实验室选择的公开粒度。本届为申请阶段信息，不计入统计。",
      cmd: "./outcomes --by cohort",
      lines: [
        ...asciiTable([
          ["COHORT", "DESTINATIONS", "STAGE"],
          ...outcomeCohorts.map((c) => [
            String(c.cohort),
            c.orgIds.map(orgName).join(" · "),
            c.stage === "final" ? "final" : "current",
          ]),
          ["intern", internshipOrgIds.map(orgName).join(" · "), "industry"],
        ]).map((row) => ({ node: row, cls: "vc2-pre" })),
        { node: " " },
        {
          node: (
            <span className="vc2-dim">
              * final = 毕业时的最终去向；current = 本届申请阶段，不计入统计。
            </span>
          ),
        },
      ],
    },
    {
      id: "s-work",
      no: "03",
      tab: "WORK",
      kicker: "03 / WORK — 成果",
      title: "成果是真实运行的系统。",
      body: "S&P、CCS、Computers & Security。论文、代码与新闻报道都在终端输出里，整块可点。",
      cmd: 'grep -r "published" ./pubs',
      lines: publications.flatMap((p, i) => [
        {
          node: (
            <>
              <span className="vc2-amber">
                Fig. {String(i + 1).padStart(2, "0")}
              </span>
              <span className="vc2-dim">
                {" "}
                | {p.venue} | {p.year}
                {p.badges?.length ? ` | ${p.badges.join(" · ")}` : ""}
              </span>
            </>
          ),
        },
        {
          node: (
            <a className="vc2-tblock" href={p.links[0]?.href} target="_blank" rel="noreferrer">
              <span className="vc2-l vc2-bright">{p.title}</span>
              <span className="vc2-l vc2-dim">
                {p.authors.map((a, j) => (
                  <span key={j} className={a.lab ? "vc2-lab" : ""}>
                    {a.name}
                    {a.corresponding ? "*" : ""}
                    {j < p.authors.length - 1 ? ", " : ""}
                  </span>
                ))}
              </span>
              <span className="vc2-l vc2-linkline">
                {p.links.map((l) => `[${l.label} ↗] `)}
              </span>
            </a>
          ),
        },
      ]),
    },
    {
      id: "s-culture",
      no: "04",
      tab: "CULTURE",
      kicker: "04 / CULTURE — 文化",
      title: "不打卡。",
      body: "机制不是口号：自主安排节奏，关键环节有指导；论文全程参与，一作属于学生。",
      cmd: "cat 04-culture.md",
      lines: [
        {
          node: (
            <span className="vc2-bright vc2-big">
              <span className="vc2-rust"># </span>
              {culture.phrase}
            </span>
          ),
        },
        { node: <span className="vc2-dim">{culture.sub}</span> },
        { node: " " },
        ...culture.rules.flatMap((r) => [
          {
            node: (
              <span className="vc2-rust">
                - <span className="vc2-bright">{r.title}</span>
              </span>
            ),
          },
          { node: <span className="vc2-indent vc2-dim">{r.body}</span>, cls: "vc2-wrap" },
        ]),
      ],
    },
    {
      id: "s-contact",
      no: "05",
      tab: "CONTACT",
      kicker: "05 / CONTACT — 联系",
      title: "写封邮件，聊聊。",
      body: "长期招募博士毕业生，也欢迎研究生与希望尽早参与科研的本科生。终端输出完这一屏，就是全部了。",
      cmd: `mail -s "join" ${site.email}`,
      lines: [
        ...site.audience.map((a) => ({
          node: <span className="vc2-dim">&gt; {a}</span>,
        })),
        { node: " " },
        {
          node: (
            <span className="vc2-mailrow">
              <a className="vc2-mail" href={`mailto:${site.email}`}>
                {site.email}
              </a>
              <button className="vc2-copy" onClick={copyEmail}>
                {copied ? "[ copied ✓ ]" : "[ copy ]"}
              </button>
            </span>
          ),
        },
        { node: " " },
        {
          node: (
            <span className="vc2-dim">
              links:{" "}
              {site.footerLinks.map((l) => (
                <a key={l.href} className="vc2-inline" href={l.href} target="_blank" rel="noreferrer">
                  [{l.label} ↗]
                </a>
              ))}
            </span>
          ),
        },
      ],
    },
  ];
}

/* ---------- 页面 ---------- */

export default function VariantC() {
  const [active, setActive] = useState(0);
  const [playKey, setPlayKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const blockRefs = useRef<(HTMLElement | null)[]>([]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* 剪贴板不可用时静默 */
    }
  };

  const sections = buildSections(copied, copyEmail);

  // 右栏标题块进入视口中部 → 切换左栏终端内容
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const idx = Number((e.target as HTMLElement).dataset.idx);
          setActive((prev) => {
            if (prev === idx) return prev;
            setPlayKey((k) => k + 1);
            return idx;
          });
        });
      },
      { rootMargin: "-42% 0px -48% 0px" },
    );
    blockRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  // 首次滚进叙事区时开播第一节
  useEffect(() => {
    const first = blockRefs.current[0];
    if (!first) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setPlayKey((k) => Math.max(k, 1));
          io.disconnect();
        }
      },
      { rootMargin: "-20% 0px" },
    );
    io.observe(first);
    return () => io.disconnect();
  }, []);

  return (
    <main className="vc2">
      {/* 顶栏 */}
      <header className="vc2-top">
        <a className="vc2-brand" href="#top">
          <span className="vc2-mark" aria-hidden>
            ▞▚
          </span>{" "}
          CUMT-SYSSEC
        </a>
        <nav className="vc2-nav">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className={active === Number(s.no) - 1 ? "on" : ""}>
              {s.tab}
            </a>
          ))}
        </nav>
      </header>

      <HeroTerminal />

      {/* 叙事区：左 sticky 终端，右标题块 */}
      <div className="vc2-story" id="story">
        <div className="vc2-left">
          <div className="vc2-sticky">
            <Terminal
              key={active}
              tab={`${sections[active].no} ${sections[active].tab}`}
              cmd={sections[active].cmd}
              lines={sections[active].lines}
              playKey={playKey}
            />
          </div>
        </div>
        <div className="vc2-right">
          {sections.map((s, i) => (
            <section
              key={s.id}
              id={s.id}
              data-idx={i}
              ref={(el) => {
                blockRefs.current[i] = el;
              }}
              className={`vc2-block${active === i ? " on" : ""}`}
            >
              <span className="vc2-kicker">{s.kicker}</span>
              <h2 className="vc2-title">{s.title}</h2>
              <p className="vc2-blockbody">{s.body}</p>
              {/* 移动端：每节内嵌静态终端 */}
              <div className="vc2-inline-term">
                <Terminal
                  tab={`${s.no} ${s.tab}`}
                  cmd={s.cmd}
                  lines={s.lines}
                  playKey={-1}
                  staticMode
                />
              </div>
            </section>
          ))}
        </div>
      </div>

      <footer className="vc2-foot">
        <span>© 2026 CUMT-SYSSEC · verified {site.lastVerified}</span>
        <span className="vc2-dim">EOF</span>
      </footer>

      <a className="vc2-labback" href="/lab/">
        ← LAB
      </a>
    </main>
  );
}
