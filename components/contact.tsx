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
      className="scroll-mt-8 text-center"
    >
      <Reveal>
        <h2
          id="contact-title"
          className="mx-auto max-w-[680px] text-[clamp(1.5rem,3.5vw,2.25rem)] leading-[1.35] font-semibold text-balance"
        >
          对这些研究问题感兴趣，欢迎交流。
        </h2>
        <ul className="mx-auto mt-8 max-w-[560px] space-y-2 text-[15px] leading-[1.75] text-body">
          {site.audience.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
        <div className="mt-10 flex flex-col items-center gap-4">
          <a
            href={`mailto:${site.email}`}
            className="rounded-full bg-accent px-7 py-3 font-mono text-[15px] font-semibold text-white transition-colors hover:bg-ink"
          >
            {site.email}
          </a>
          <CopyEmail email={site.email} />
        </div>
      </Reveal>
    </section>
  );
}
