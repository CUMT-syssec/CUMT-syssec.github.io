import type { Teacher } from "@/lib/types";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { TermCard } from "./term-card";

/** 紧凑教师条目：姓名、职务、方向、简介与链接。 */
function TeacherCard({ t }: { t: Teacher }) {
  return (
    <article className="flex h-full flex-col border-t border-ink/15 pt-5 text-left">
      <h3 className="text-xl font-semibold">{t.name}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-aux">
        {t.roles.join(" · ")}
      </p>
      <p className="mt-3 text-sm leading-[1.7] text-ink">
        研究方向：{t.directions.join("、")}
      </p>
      <p className="mt-2 text-sm leading-[1.7] text-body">{t.bio}</p>
      {t.links.length > 0 && (
        <ul className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-4 text-sm">
          {t.links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-accent underline-offset-4 hover:underline"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

/**
 * 主要教师：首位教师全宽特色位（左身份右简介），其余教师 2×2 对称网格，
 * 避免 5 项在 2/3 列网格里留下孤格。
 */
export function Teachers({ teachers }: { teachers: Teacher[] }) {
  const [featured, ...rest] = teachers;

  return (
    <section
      id="teachers"
      aria-labelledby="teachers-title"
      className="scroll-mt-8"
    >
      <SectionHeading
        id="teachers-title"
        title="主要教师"
        sub="认识与你一起做研究的人。"
      />

      {featured && (
        <Reveal>
          <article className="border-t border-ink/15 pt-5 text-left md:flex md:gap-10">
            <div className="shrink-0 md:w-52">
              <h3 className="text-2xl font-semibold">{featured.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-aux">
                {featured.roles.join(" · ")}
              </p>
              {featured.links.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                  {featured.links.map((l) => (
                    <li key={l.href}>
                      <a
                        href={l.href}
                        className="text-accent underline-offset-4 hover:underline"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="mt-4 min-w-0 md:mt-0">
              <p className="text-sm leading-[1.7] text-ink">
                研究方向：{featured.directions.join("、")}
              </p>
              <p className="mt-2 text-sm leading-[1.8] text-body">
                {featured.bio}
              </p>
            </div>
          </article>
        </Reveal>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {rest.map((t) => (
          <Reveal key={t.id} className="min-w-0">
            <TeacherCard t={t} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
