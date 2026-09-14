"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  culture,
  internshipOrgIds,
  organizations,
  outcomeCohorts,
  publications,
  site,
  teachers,
} from "@/lib/content";
import "./a.css";

/**
 * 方案 A — 索引档案 INDEX（灵感：specia1ne.com）
 * 瑞士网格 × 编目编号 × 终端元数据。01–06 章节、细线、括弧 CTA、活时钟。
 */

const orgName = (id: string) =>
  organizations.find((o) => o.id === id)?.name ?? id;

/** 活时钟：徐州（UTC+8），致敬 specia1ne 页脚的 Lviv 时钟 */
function LiveClock() {
  const [now, setNow] = useState<string>("--:--:--");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Shanghai",
    });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="va-clock">
      {now} <em>徐州</em>
    </span>
  );
}

/** 标题关键词划换：旧词划线退出，新词划入 */
const MORPH_WORDS = ["内核", "虚拟化", "云计算", "Agent"];
function MorphWord() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % MORPH_WORDS.length), 2400);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="va-morph">
      <AnimatePresence mode="wait">
        <motion.span
          key={MORPH_WORDS[i]}
          initial={{ y: "0.55em", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-0.55em", opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          {MORPH_WORDS[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** 章节元数据头：NN / 06 —— 中文 英文 + 右侧注记 */
function Chapter({
  no,
  zh,
  en,
  note,
}: {
  no: string;
  zh: string;
  en: string;
  note?: string;
}) {
  return (
    <div className="va-chap">
      <motion.div
        className="va-chap-l"
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-12% 0px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <span className="va-chap-no">{no} / 06</span>
        <span className="va-chap-dash">——</span>
        <span className="va-chap-name">
          {zh} <em>{en}</em>
        </span>
      </motion.div>
      {note ? <span className="va-chap-note">{note}</span> : null}
    </div>
  );
}

export default function VariantA() {
  return (
    <main className="va">
      {/* 顶栏：品牌 + 元数据 + 活时钟 */}
      <header className="va-top">
        <a className="va-brand" href="#top">
          CUMT-SYSSEC<sup>®</sup>
        </a>
        <span className="va-top-meta">系统安全实验室 · INDEX 01–06</span>
        <LiveClock />
      </header>

      {/* 01 / 信号 */}
      <section className="va-hero" id="top">
        <div className="va-hero-meta">
          <span>01 / 06 —— 信号 SIGNAL</span>
          <span>EST. 中国矿业大学 · 计算机科学与技术学院 / 人工智能学院</span>
        </div>
        <h1 className="va-h1">
          让 <MorphWord />
          <br />
          更安全<span className="va-accent">。</span>
        </h1>
        <span className="va-hero-no" aria-hidden>
          01
        </span>
        <div className="va-hero-sub">
          <p>
            {site.directions.join(" · ")}
            <br />
            <em>做真实构建、真实运行的系统安全研究。</em>
          </p>
          <div className="va-cta-row">
            <a className="va-cta" href="#contact">
              [ 申请加入 ]
            </a>
            <a className="va-cta" href="#work">
              [ 查看成果 ↓ ]
            </a>
          </div>
        </div>
      </section>

      {/* 02 / 人员 */}
      <section className="va-sec" id="team">
        <Chapter no="02" zh="人员" en="PEOPLE" note={`在编 ${String(teachers.length).padStart(2, "0")} 位教师`} />
        <ul className="va-rows">
          {teachers.map((t, i) => (
            <li key={t.id}>
              <a
                className="va-row"
                href={t.links[0]?.href}
                target="_blank"
                rel="noreferrer"
              >
                <span className="va-row-idx">02.{i + 1}</span>
                <span className="va-row-name">{t.name}</span>
                <span className="va-row-roles">{t.roles.join(" · ")}</span>
                <span className="va-row-tags">
                  {t.directions.slice(0, 3).map((d) => (
                    <em key={d}>[{d}]</em>
                  ))}
                </span>
                <span className="va-row-bio">{t.bio}</span>
                <span className="va-row-arrow">↗</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* 03 / 去向 */}
      <section className="va-sec" id="paths">
        <Chapter no="03" zh="去向" en="PATHS" note="按毕业届别 · 不记名" />
        <ul className="va-rows">
          {outcomeCohorts.map((c, i) => (
            <li key={c.cohort} className="va-row va-row-static">
              <span className="va-row-idx">03.{i + 1}</span>
              <span className="va-row-name va-mono">{c.cohort}</span>
              <span className="va-row-dsts">
                {c.orgIds.map(orgName).join(" · ")}
              </span>
              <span className="va-row-flag">
                [{c.stage === "final" ? "往届去向" : "本届 · 申请中"}]
              </span>
            </li>
          ))}
          <li className="va-row va-row-static va-row-dim">
            <span className="va-row-idx">03.∞</span>
            <span className="va-row-name va-mono">实习</span>
            <span className="va-row-dsts">
              {internshipOrgIds.map(orgName).join(" · ")}
            </span>
            <span className="va-row-flag">[INDUSTRY]</span>
          </li>
        </ul>
      </section>

      {/* 04 / 成果 */}
      <section className="va-sec" id="work">
        <Chapter no="04" zh="成果" en="WORK" note={`收录 ${String(publications.length).padStart(2, "0")} 篇代表作`} />
        <ul className="va-rows">
          {publications.map((p, i) => (
            <li key={p.id}>
              <a
                className="va-row va-pub"
                href={p.links[0]?.href}
                target="_blank"
                rel="noreferrer"
              >
                <span className="va-row-idx">04.{i + 1}</span>
                <span className="va-pub-main">
                  <span className="va-pub-title">{p.title}</span>
                  <span className="va-pub-meta">
                    {p.venue} · {p.year}
                    {p.badges?.map((b) => <em key={b}> [{b}]</em>)
                    }
                  </span>
                </span>
                <span className="va-row-arrow">↗</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* 05 / 文化 */}
      <section className="va-sec" id="culture">
        <Chapter no="05" zh="文化" en="METHOD" note="真实机制，不是口号" />
        <h2 className="va-phrase">
          {culture.phrase.replace("。", "")}
          <span className="va-accent">。</span>
        </h2>
        <p className="va-phrase-sub">{culture.sub}</p>
        <div className="va-grid4">
          {culture.rules.map((r, i) => (
            <div className="va-cell" key={r.title}>
              <span className="va-cell-no">05.{i + 1}</span>
              <h3>{r.title}</h3>
              <p>{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 06 / 联系 */}
      <section className="va-sec va-contact" id="contact">
        <Chapter no="06" zh="联系" en="CONTACT" note="长期招募" />
        <h2 className="va-h2">
          把名字写进
          <br />
          下一篇 S&amp;P<span className="va-accent">。</span>
        </h2>
        <ul className="va-aud">
          {site.audience.map((a) => (
            <li key={a}>· {a}</li>
          ))}
        </ul>
        <a className="va-mail" href={`mailto:${site.email}`}>
          [ {site.email} ]
        </a>
      </section>

      <footer className="va-foot">
        <span>© 2026 CUMT-SYSSEC</span>
        <span>内容核验于 {site.lastVerified}</span>
        <span className="va-foot-links">
          {site.footerLinks.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
              [ {l.label} ↗ ]
            </a>
          ))}
        </span>
        <LiveClock />
      </footer>

      <a className="va-labback" href="/lab/">
        ← LAB
      </a>
    </main>
  );
}
