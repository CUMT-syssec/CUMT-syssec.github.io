import type { CultureContent } from "@/lib/types";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { TermCard } from "./term-card";

/**
 * 我们如何做研究：回到深色背景，形成第二个视觉记忆点。
 * 以四项规则说明呈现研究文化。
 */
export function Culture({ culture }: { culture: CultureContent }) {
  return (
    <section
      id="culture"
      aria-labelledby="culture-title"
      className="scroll-mt-8"
    >
      <div className="mx-auto max-w-[880px] px-6 py-[64px] md:py-[104px]">
        <SectionHeading id="culture-title" title="我们如何做研究" dark />

        <div className="mb-10 max-w-[560px] md:mb-12">
          <TermCard
            dark
            label="culture"
            cmd="cat culture.md"
            lines={[
              <span key="p" className="term-strong">
                # {culture.phrase}
              </span>,
              <span key="s">&gt; {culture.sub}</span>,
            ]}
          />
        </div>

        <div className="space-y-5">
          {culture.rules.map((r, i) => (
            <Reveal key={r.title} delay={i * 60}>
              <section className="rounded-2xl bg-panel p-6 md:p-7">
                <h3 className="text-lg font-semibold md:text-xl">{r.title}</h3>
                <p className="mt-2 max-w-[680px] text-[15px] leading-[1.8] text-mist">
                  {r.body}
                </p>
              </section>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
