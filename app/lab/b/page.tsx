"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useState } from "react";
import {
  culture,
  internshipOrgIds,
  organizations,
  outcomeCohorts,
  publications,
  site,
  teachers,
} from "@/lib/content";
import "./b.css";

/**
 * 方案 B — 巨字动能 KINETIC（灵感：runrobrun.com）
 * 巨型压缩排版、滚动计数、逐词点亮、无限 marquee、旋转徽章。黑底 + 酸性绿。
 */

const orgName = (id: string) =>
  organizations.find((o) => o.id === id)?.name ?? id;

/** 右上角实时滚动百分比 */
function ScrollCounter() {
  const { scrollYProgress } = useScroll();
  const spring = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  const [pct, setPct] = useState(0);
  useMotionValueEvent(spring, "change", (v) =>
    setPct(Math.round(v * 100)),
  );
  return (
    <span className="vb-counter">
      Scroll <em>{String(pct).padStart(3, "0")}%</em>
    </span>
  );
}

/** 逐词点亮的滚动叙事段落 */
function LightWords({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.82", "start 0.3"],
  });
  const words = text.split(" ");
  return (
    <p className="vb-words" ref={ref}>
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} word={w} />
      ))}
    </p>
  );
}

function Word({
  progress,
  range,
  word,
}: {
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  range: [number, number];
  word: string;
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className="vb-word">
      {word}{" "}
    </motion.span>
  );
}

/** 旋转徽章：环形文字 */
function SpinBadge() {
  return (
    <div className="vb-badge" aria-hidden>
      <svg viewBox="0 0 120 120">
        <defs>
          <path
            id="vb-circle"
            d="M 60,60 m -46,0 a 46,46 0 1,1 92,0 a 46,46 0 1,1 -92,0"
          />
        </defs>
        <text>
          <textPath href="#vb-circle">
            CUMT · SYSSEC · XUZHOU · 系统安全 · EST ·
          </textPath>
        </text>
      </svg>
      <span className="vb-badge-core">↓</span>
    </div>
  );
}

export default function VariantB() {
  const marqueeItems = [
    "系统安全与优化",
    "虚拟化",
    "云计算安全",
    "AGENT 安全",
  ];
  const marquee = Array(3)
    .fill(marqueeItems)
    .flat()
    .map((s, i) => (
      <span key={i}>
        {s} <em>✦</em>{" "}
      </span>
    ));

  return (
    <main className="vb">
      {/* 顶栏 */}
      <header className="vb-top">
        <a className="vb-brand" href="#top">
          SYSSEC<sup>®</sup>
        </a>
        <nav className="vb-nav">
          <a href="#team">成员</a>
          <a href="#work">成果</a>
          <a href="#contact">联系</a>
        </nav>
        <ScrollCounter />
      </header>

      {/* 首屏：巨型两行 */}
      <section className="vb-hero" id="top">
        <p className="vb-hero-kicker">
          （系统安全实验室 — 中国矿业大学）
        </p>
        <h1 className="vb-h1">
          <motion.span
            initial={{ y: "0.35em", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            SYSTEM
          </motion.span>
          <motion.span
            initial={{ y: "0.35em", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            SECURITY<sup>®</sup>
          </motion.span>
        </h1>
        <SpinBadge />
        <div className="vb-marquee" aria-hidden>
          <div className="vb-marquee-in">{marquee}</div>
          <div className="vb-marquee-in">{marquee}</div>
        </div>
      </section>

      {/* 滚动叙事 */}
      <section className="vb-intro">
        <span className="vb-tag">[ ABOUT — 我们是谁 ]</span>
        <LightWords text="我们 研究 系统安全： 从 内核完整性 到 虚拟化， 从 云计算 到 Agent—— 不做 停在纸面 的 研究， 只做 真实构建、 真实运行 的 系统。" />
      </section>

      {/* 成员 */}
      <section className="vb-sec" id="team">
        <div className="vb-sec-head">
          <span className="vb-tag">[ 01 — TEAM ]</span>
          <h2 className="vb-h2">
            成员<sup>{String(teachers.length).padStart(2, "0")}</sup>
          </h2>
        </div>
        <ul className="vb-rows">
          {teachers.map((t, i) => (
            <li key={t.id}>
              <a
                className="vb-row"
                href={t.links[0]?.href}
                target="_blank"
                rel="noreferrer"
              >
                <span className="vb-row-no">{String(i + 1).padStart(2, "0")}</span>
                <span className="vb-row-name">{t.name}</span>
                <span className="vb-row-meta">
                  {t.roles.join(" / ")}
                  <em>{t.directions.slice(0, 3).join(" · ")}</em>
                </span>
                <span className="vb-row-arrow">→</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* 去向 */}
      <section className="vb-sec" id="paths">
        <div className="vb-sec-head">
          <span className="vb-tag">[ 02 — PATHS ]</span>
          <h2 className="vb-h2">去向</h2>
        </div>
        <ul className="vb-rows">
          {outcomeCohorts.map((c) => (
            <li className="vb-row vb-row-static" key={c.cohort}>
              <span className="vb-row-no vb-row-year">{c.cohort}</span>
              <span className="vb-row-name vb-row-dsts">
                {c.orgIds.map(orgName).join(" · ")}
              </span>
              <span className="vb-row-meta">
                {c.stage === "final" ? "往届去向" : "本届 · 申请阶段"}
              </span>
            </li>
          ))}
          <li className="vb-row vb-row-static vb-row-dim">
            <span className="vb-row-no">INT</span>
            <span className="vb-row-name vb-row-dsts">
              {internshipOrgIds.map(orgName).join(" · ")}
            </span>
            <span className="vb-row-meta">实习</span>
          </li>
        </ul>
      </section>

      {/* 成果 */}
      <section className="vb-sec" id="work">
        <div className="vb-sec-head">
          <span className="vb-tag">[ 03 — WORK ]</span>
          <h2 className="vb-h2">
            成果<sup>{String(publications.length).padStart(2, "0")}</sup>
          </h2>
        </div>
        <ul className="vb-rows">
          {publications.map((p, i) => (
            <li key={p.id}>
              <a
                className="vb-row vb-row-pub"
                href={p.links[0]?.href}
                target="_blank"
                rel="noreferrer"
              >
                <span className="vb-row-no">{String(i + 1).padStart(2, "0")}</span>
                <span className="vb-pub-main">
                  <span className="vb-row-name vb-pub-title">{p.title}</span>
                  <span className="vb-row-meta">
                    {p.venue} · {p.year}
                    {p.badges?.length ? ` — ${p.badges.join(" / ")}` : ""}
                  </span>
                </span>
                <span className="vb-row-arrow">→</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* 文化 */}
      <section className="vb-sec vb-culture" id="culture">
        <span className="vb-tag">[ 04 — CULTURE ]</span>
        <h2 className="vb-giant">{culture.phrase}</h2>
        <p className="vb-culture-sub">{culture.sub}</p>
        <ul className="vb-rules">
          {culture.rules.map((r, i) => (
            <li key={r.title}>
              <span className="vb-rule-no">[{String(i + 1).padStart(2, "0")}]</span>
              <strong>{r.title}</strong>
              <span>{r.body}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 联系 */}
      <section className="vb-contact" id="contact">
        <span className="vb-tag">[ 05 — JOIN US ]</span>
        <h2 className="vb-h1 vb-h1-sm">
          <span>TALK</span>
          <span>TO US</span>
        </h2>
        <ul className="vb-aud">
          {site.audience.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
        <a className="vb-mail" href={`mailto:${site.email}`}>
          {site.email} <em>↗</em>
        </a>
      </section>

      <footer className="vb-foot">
        <span>© 2026 CUMT-SYSSEC</span>
        <span>LAST VERIFIED {site.lastVerified}</span>
        <span className="vb-foot-links">
          {site.footerLinks.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
              {l.label} ↗
            </a>
          ))}
        </span>
      </footer>

      <a className="vb-labback" href="/lab/">
        ← LAB
      </a>
    </main>
  );
}
