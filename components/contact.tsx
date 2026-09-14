import type { SiteInfo } from "@/lib/types";
import { Reveal } from "./reveal";
import { TermCard, TermCopy } from "./term-card";

/**
 * 联系我们：主标题在外，邀请、适用人群与邮箱收进终端卡片。
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
      </Reveal>
      <div className="mx-auto mt-10 max-w-[640px] text-left">
        <TermCard
          label="contact"
          cmd={`mail -s "join" ${site.email}`}
          lines={[
            ...site.audience.map((a) => ({
              node: <span className="t-dim">&gt; {a}</span>,
            })),
            { node: " " },
            {
              node: (
                <span className="t-mailrow">
                  <a className="t-mail" href={`mailto:${site.email}`}>
                    {site.email}
                  </a>
                  <TermCopy text={site.email} />
                </span>
              ),
            },
            { node: " " },
            {
              node: (
                <span className="t-dim">
                  links:{" "}
                  {site.footerLinks.map((l, i) => (
                    <span key={l.href}>
                      <a
                        className="t-link"
                        href={l.href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        [{l.label} ↗]
                      </a>
                      {i < site.footerLinks.length - 1 ? " " : ""}
                    </span>
                  ))}
                </span>
              ),
            },
          ]}
        />
      </div>
    </section>
  );
}
