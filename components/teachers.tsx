import type { Teacher } from "@/lib/types";
import { SectionHeading } from "./section-heading";
import { TermCard } from "./term-card";

/**
 * 主要教师：主副标题在外，条目全部装进终端卡片。
 * 每位教师一整块可点（整块即教师主页链接），悬停有反馈。
 */
export function Teachers({ teachers }: { teachers: Teacher[] }) {
  return (
    <section
      id="teachers"
      aria-labelledby="teachers-title"
      className="scroll-mt-8"
    >
      <SectionHeading
        id="teachers-title"
        title="主要教师"
        sub="认识与你一起做研究的人。"
      />
      <div className="mx-auto max-w-[720px]">
        <TermCard
          label="team"
          cmd="cat 01-team.md"
          lines={teachers.flatMap((t) => [
            {
              node: (
                <a
                  className="t-block"
                  href={t.links[0]?.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="t-l">
                    <span className="t-title">{t.name}</span>{" "}
                    <span className="t-dim">—— {t.roles.join(" · ")}</span>{" "}
                    <span className="t-link">↗</span>
                  </span>
                  <span className="t-l t-indent t-dim">
                    方向：{t.directions.join("、")}
                  </span>
                  <span className="t-l t-indent">{t.bio}</span>
                </a>
              ),
            },
          ])}
        />
      </div>
    </section>
  );
}
