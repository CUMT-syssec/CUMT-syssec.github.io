import type { CultureContent } from "@/lib/types";
import { SectionHeading } from "./section-heading";
import { FlipLine } from "./flip-line";
import { Reveal } from "./reveal";

/**
 * 我们如何做研究：回到深色背景，形成第二个视觉记忆点。
 * 翻牌只播放一次，随后静止；规则说明始终完整显示。
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

        <Reveal delay={60}>
          <p className="text-[clamp(3rem,10vw,5.5rem)] leading-none font-bold tracking-tight">
            <FlipLine text={culture.phrase} />
          </p>
          <p className="mt-6 text-lg text-mist md:text-xl">{culture.sub}</p>
        </Reveal>

        <div className="mt-14 space-y-5 md:mt-16">
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
