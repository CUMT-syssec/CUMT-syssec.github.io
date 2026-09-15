import type { DirectionsContent } from "@/lib/types";
import { SectionHeading } from "./section-heading";
import { TermCard } from "./term-card";

/**
 * 研究方向：man directions 手册页。
 * 版式对齐真实 man 输出（本机 man 2.9.1 实测）：三段式页眉/页脚、
 * 段标题加粗顶格、正文缩进 7 列、"name - 描述" 用半角连字符、段间空行。
 * SEE ALSO 每行整块可点，悬停反馈与教师卡、论文卡一致。
 */
export function Directions({ directions }: { directions: DirectionsContent }) {
  return (
    <section
      id="directions"
      aria-labelledby="directions-title"
      className="scroll-mt-8"
    >
      <SectionHeading
        id="directions-title"
        title="研究方向"
        sub="从 ring 0 到 Agent 层，一路向上。"
      />
      <div className="mx-auto max-w-[720px]">
        <TermCard
          label="directions"
          cmd="man directions"
          lines={[
            {
              node: (
                <span className="t-manhead">
                  <span>DIRECTIONS(1)</span>
                  <span>Research Manual</span>
                  <span>DIRECTIONS(1)</span>
                </span>
              ),
            },
            { node: "" },
            { node: <span className="t-strong">NAME</span> },
            ...directions.entries.map((d) => ({
              cls: "t-manin",
              node: (
                <>
                  {d.name}
                  {" - "}
                  {d.desc}
                </>
              ),
            })),
            { node: "" },
            { node: <span className="t-strong">SEE ALSO</span> },
            ...directions.seeAlso.map((l) => ({
              node: (
                <a
                  className="t-block t-manlink"
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="t-link">{l.label} ↗</span>
                </a>
              ),
            })),
            { node: "" },
            {
              node: (
                <span className="t-manhead">
                  <span>CUMT-SYSSEC</span>
                  <span>2026-09</span>
                  <span>DIRECTIONS(1)</span>
                </span>
              ),
            },
          ]}
        />
      </div>
    </section>
  );
}
