import type { CultureContent } from "@/lib/types";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

/**
 * 我们如何做研究：标题 + 点睛短语（呼应首屏的大字陈述）+ 2×2 规则网格。
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
        sub={culture.sub}
      />

      <Reveal>
        <p className="mb-10 text-center font-mono text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.25] font-extrabold tracking-[-0.02em] text-brand md:mb-12">
          {culture.phrase}
        </p>
      </Reveal>

      <div className="grid gap-6 md:grid-cols-2">
        {culture.rules.map((r, i) => (
          <Reveal key={r.title} delay={i * 60}>
            <section className="h-full rounded-2xl border border-ink/10 bg-paper p-6 md:p-7">
              <h3 className="text-lg font-semibold md:text-xl">{r.title}</h3>
              <p className="mt-2 text-[15px] leading-[1.8] text-body">
                {r.body}
              </p>
            </section>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
