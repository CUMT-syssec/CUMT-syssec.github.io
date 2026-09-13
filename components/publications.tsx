import { Fragment } from "react";
import type { Publication } from "@/lib/types";
import {
  publicationReference,
  sortPublications,
  STATUS_LABEL,
} from "@/lib/publications";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

/**
 * 科研成果：代表性论文清单，同一连续列表，按正式发表年份从新到旧。
 * 不截断标题、不省略作者、不用轮播、不做营销式陈列。
 */
export function Publications({ publications }: { publications: Publication[] }) {
  const sorted = sortPublications(publications);

  return (
    <section
      id="publications"
      aria-labelledby="publications-title"
      className="scroll-mt-8"
    >
      <SectionHeading
        id="publications-title"
        title="科研成果"
        sub="围绕系统安全问题，构建可验证、可落地的研究成果。"
      />
      <Reveal delay={60}>
        <ol>
          {sorted.map((p) => (
            <li
              key={p.id}
              className="border-t border-ink/10 py-7 first:border-t-0 first:pt-0 md:py-8"
            >
              <h3 className="max-w-[760px] text-lg leading-[1.5] font-medium break-words md:text-[1.375rem]">
                {p.title}
              </h3>
              <p className="mt-3 max-w-[760px] text-sm leading-[1.75] text-body">
                {p.authors.map((a, i) => (
                  <Fragment key={i}>
                    {i > 0 && ", "}
                    <span className={a.lab ? "font-semibold text-ink" : undefined}>
                      {a.name}
                      {a.corresponding ? "*" : ""}
                    </span>
                  </Fragment>
                ))}
              </p>
              {/* 已发表为默认状态不标注；仅"已接收/预印本"需要显式区分 */}
              <p className="mt-2 max-w-[760px] text-sm leading-[1.75] text-aux">
                {publicationReference(p)}
                {p.status !== "published" && (
                  <Fragment>
                    {" · "}
                    <span className="whitespace-nowrap">{STATUS_LABEL[p.status]}</span>
                  </Fragment>
                )}
                {p.badges?.map((b) => (
                  <Fragment key={b}>
                    {" · "}
                    <span className="whitespace-nowrap">{b}</span>
                  </Fragment>
                ))}
              </p>
              {p.links.length > 0 && (
                <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
                  {p.links.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      className="text-accent underline-offset-4 hover:underline"
                    >
                      {l.label}
                    </a>
                  ))}
                </p>
              )}
            </li>
          ))}
        </ol>
        <p className="mt-8 text-[13px] text-aux">
          加粗为实验室成员；* 为通讯作者。
        </p>
      </Reveal>
    </section>
  );
}
