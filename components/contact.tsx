import type { SiteInfo } from "@/lib/types";
import { CopyEmail } from "./copy-email";
import { Reveal } from "./reveal";
import { TermCard } from "./term-card";

/**
 * 联系我们：简短邀请、适用人群与邮箱。
 * 邮箱文字直接可见、可选择复制；复制按钮只是增强。
 */
export function Contact({ site }: { site: SiteInfo }) {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="scroll-mt-8 border-t border-white/8"
    >
      <div className="mx-auto max-w-[880px] px-6 py-[64px] text-center md:py-[96px]">
        <Reveal>
          <h2
            id="contact-title"
            className="mx-auto max-w-[680px] text-[clamp(1.5rem,3.5vw,2.25rem)] leading-[1.35] font-semibold"
          >
            对这些研究问题感兴趣，欢迎交流。
          </h2>
          <div className="mx-auto mt-10 max-w-[560px]">
            <TermCard
              dark
              label="contact"
              cmd={`mail -s "join" ${site.email}`}
              lines={[<span key="r">&gt; 期待你的来信。</span>]}
            />
          </div>
          <ul className="mt-10 space-y-2 text-[15px] leading-[1.75] text-mist">
            {site.audience.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          <div className="mt-10 flex flex-col items-center gap-4">
            <a
              href={`mailto:${site.email}`}
              className="rounded-full bg-sky px-7 py-3 font-mono text-[15px] font-semibold text-night transition-colors hover:bg-snow focus-visible:outline-snow"
            >
              {site.email}
            </a>
            <CopyEmail email={site.email} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
