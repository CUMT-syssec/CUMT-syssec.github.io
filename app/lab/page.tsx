import "./lab.css";

/**
 * 展示平台索引页：三个设计方向的实时预览与入口。
 * 每个卡片内嵌对应方案的 iframe 实时渲染（缩比、禁交互），点击进全屏。
 */

const variants = [
  {
    id: "a",
    href: "/lab/a/",
    code: "A",
    name: "索引档案",
    nameEn: "INDEX",
    inspired: "specia1ne.com",
    summary:
      "瑞士国际主义网格 × 编目式编号 × 终端元数据。全站分为 01–06 六个章节，细线分隔、括弧按钮、实时时钟、标题关键词划换。克制、精确、像一份活的工程档案。",
    tags: ["编号章节", "括弧 CTA", "活时钟", "词形变换", "细线网格"],
    accent: "#ff4d00",
  },
  {
    id: "b",
    href: "/lab/b/",
    code: "B",
    name: "巨字动能",
    nameEn: "KINETIC",
    inspired: "runrobrun.com",
    summary:
      "铺满视口的巨型压缩字体、滚动百分比计数、无限 marquee、逐词点亮的滚动叙事、旋转徽章。黑底骨白大字配酸性荧光绿，速度感与张力拉满。",
    tags: ["巨型排版", "滚动计数", "逐词 reveal", "Marquee", "酸性绿"],
    accent: "#c8ff16",
  },
  {
    id: "c",
    href: "/lab/c/",
    code: "C",
    name: "终端原生",
    nameEn: "CONSOLE",
    inspired: "pi.dev",
    summary:
      "整站即终端：开机自检序列、$ 命令分节、ASCII 表格、闪烁光标、copy 即走的邮箱。附彩蛋 Crooked Mode。极客、诚实、零营销腔——最像实验室自己的气质。",
    tags: ["开机序列", "命令分节", "ASCII", "彩蛋开关", "全等宽"],
    accent: "#57ff57",
  },
];

export default function LabIndex() {
  return (
    <main className="labi">
      <header className="labi-top">
        <span className="labi-brand">CUMT-SYSSEC — DESIGN LAB</span>
        <span className="labi-meta">分支 feat/design-lab · 2026-09-14</span>
        <a className="labi-backhome" href="/">
          回主站 ↗
        </a>
      </header>

      <section className="labi-intro">
        <h1>
          三个方向<span className="labi-dot">。</span>
          <br />
          选一个<span className="labi-dot">。</span>
        </h1>
        <p>
          三套完整可滚动的主页方案，共用同一份真实内容数据，设计语言互不妥协。
          预览是实时渲染的——点进去滚动、悬停、 resize 都可以。选定后，以该方向重写整站。
        </p>
      </section>

      <section className="labi-list">
        {variants.map((v) => (
          <article key={v.id} className="labi-card">
            <a className="labi-shot" href={v.href}>
              <div className="labi-frame" aria-hidden>
                <iframe src={v.href} loading="lazy" tabIndex={-1} />
              </div>
              <span className="labi-enter" style={{ background: v.accent }}>
                进入全屏 →
              </span>
            </a>
            <div className="labi-info">
              <div className="labi-row">
                <span className="labi-code" style={{ color: v.accent }}>
                  {v.code}
                </span>
                <h2>
                  {v.name} <em>{v.nameEn}</em>
                </h2>
              </div>
              <p className="labi-inspired">灵感来源 · {v.inspired}</p>
              <p className="labi-summary">{v.summary}</p>
              <ul className="labi-tags">
                {v.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>

      <footer className="labi-foot">
        <span>选定的方向将替换现有主页，其余两套随本分支封存。</span>
        <span>DESIGN LAB / 03</span>
      </footer>
    </main>
  );
}
