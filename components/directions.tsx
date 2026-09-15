import type { DirectionGroup } from "@/lib/types";
import { SectionHeading } from "./section-heading";
import { TermCard } from "./term-card";

/**
 * 研究方向：主副标题在外，方向条目收进终端卡片。
 * 主方向每条一块（说明 + 延伸链接），其他方向分组罗列。
 */
export function Directions({ groups }: { groups: DirectionGroup[] }) {
  const [main, ...rest] = groups;

  return (
    <section
      id="directions"
      aria-labelledby="directions-title"
      className="scroll-mt-8"
    >
      <SectionHeading
        id="directions-title"
        title="研究方向"
        sub="从内核到 Agent，都是我们的战场。"
      />
      <div className="mx-auto max-w-[720px]">
        <TermCard
          label="directions"
          cmd="cat directions.md"
          lines={[
            ...(main?.items ?? []).flatMap((d) => [
              {
                node: (
                  <span className="t-l t-gap">
                    <span className="t-big"># {d.name}</span>
                  </span>
                ),
              },
              ...(d.blurb
                ? [{ node: <span className="t-indent t-dim">{d.blurb}</span> }]
                : []),
              ...(d.links ?? []).map((l) => ({
                node: (
                  <span className="t-indent">
                    →{" "}
                    <a
                      className="t-link"
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {l.label} ↗
                    </a>
                  </span>
                ),
              })),
            ]),
            ...rest.flatMap((g) => [
              {
                node: (
                  <span className="t-l t-gap">
                    <span className="t-strong">## {g.title}</span>
                  </span>
                ),
              },
              {
                node: (
                  <span className="t-indent t-dim">
                    {g.items.map((d) => d.name).join(" · ")}
                  </span>
                ),
              },
            ]),
          ]}
        />
      </div>
    </section>
  );
}
