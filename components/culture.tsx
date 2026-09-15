import type { CultureContent } from "@/lib/types";
import { SectionHeading } from "./section-heading";
import { TermCard } from "./term-card";

/**
 * 我们如何做研究：主副标题在外，核心短句与四条机制收进终端卡片。
 */
export function Culture({ culture }: { culture: CultureContent }) {
  return (
    <section
      id="culture"
      aria-labelledby="culture-title"
      className="scroll-mt-8"
    >
      <SectionHeading
        id="culture-title"
        title="我们如何做研究"
        sub="真实机制，不是口号。"
      />
      <div className="mx-auto max-w-[720px]">
        <TermCard
          label="culture"
          cmd="cat culture.md"
          lines={[
            {
              node: <span className="t-big"># {culture.phrase}</span>,
            },
            {
              node: <span className="t-dim">{culture.sub}</span>,
            },
            ...culture.rules.flatMap((r) => [
              {
                node: <span className="t-accent t-strong">- {r.title}</span>,
                cls: "t-gap",
              },
              {
                node: <span className="t-indent t-dim">{r.body}</span>,
              },
            ]),
          ]}
        />
      </div>
    </section>
  );
}
