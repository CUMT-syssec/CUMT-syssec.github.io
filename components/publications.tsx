import type { Publication } from "@/lib/types";
import { sortPublications } from "@/lib/publications";
import { SectionHeading } from "./section-heading";
import { TermCard } from "./term-card";

/**
 * 科研成果：主副标题在外，论文条目收进终端卡片。
 * Fig. 编号 + 完整标题与作者（实验室成员加粗）+ 整块可点链接。
 */
export function Publications({ publications }: { publications: Publication[] }) {
  const sorted = sortPublications(publications);

  return (
    <section
      id="publications"
      aria-labelledby="publications-title"
      className="scroll-mt-8"
    >
      <SectionHeading
        id="publications-title"
        title="科研成果"
        sub="围绕系统安全问题，构建可验证、可落地的研究成果。"
      />
      <div className="mx-auto max-w-[720px]">
        <TermCard
          label="pubs"
          cmd='grep -r "published" ./pubs'
          lines={sorted.flatMap((p, i) => [
            {
              node: (
                <>
                  <span className="t-amber">
                    Fig. {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="t-dim">
                    {" "}
                    | {p.venue} | {p.year}
                    {p.badges?.length ? ` | ${p.badges.join(" · ")}` : ""}
                  </span>
                </>
              ),
              cls: i > 0 ? "t-gap" : undefined,
            },
            {
              node: (
                <a
                  className="t-block"
                  href={p.links[0]?.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="t-l t-strong">{p.title}</span>
                  <span className="t-l t-meta">
                    {p.authors.map((a, j) => (
                      <span key={j} className={a.lab ? "t-strong" : undefined}>
                        {a.name}
                        {a.corresponding ? "*" : ""}
                        {j < p.authors.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </span>
                  <span className="t-l t-link">
                    {p.links.map((l) => `[${l.label} ↗] `)}
                  </span>
                </a>
              ),
            },
          ])}
        />
      </div>
    </section>
  );
}
