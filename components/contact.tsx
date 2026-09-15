import type { SiteInfo } from "@/lib/types";
import { SectionHeading } from "./section-heading";
import { TermCard, TermCopy } from "./term-card";

/**
 * 联系我们：主副标题与其他节统一（SectionHeading），邀请与邮箱收进终端卡片。
 * 邮箱文字直接可见、可选择复制；复制按钮只是增强。
 */
export function Contact({ site }: { site: SiteInfo }) {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="scroll-mt-8 text-center"
    >
      <SectionHeading
        id="contact-title"
        title="对这些研究问题感兴趣，欢迎交流。"
        sub="终端常开，期待你的来信。"
        titleSpans={["对这些研究问题感兴趣，", "欢迎交流。"]}
      />
      <div className="mx-auto max-w-[640px] text-left">
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
