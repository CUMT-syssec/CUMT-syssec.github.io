import type { Teacher } from "@/lib/types";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { TermCard } from "./term-card";

/** 主要教师：同级并列的简短介绍，桌面双列、手机单列。 */
export function Teachers({ teachers }: { teachers: Teacher[] }) {
  return (
    <section id="teachers" aria-labelledby="teachers-title" className="scroll-mt-8">
      <SectionHeading
        id="teachers-title"
        title="主要教师"
        sub="认识与你一起做研究的人。"
      />
      <div className="mb-10 max-w-[560px] md:mb-12">
        <TermCard
          label="team"
          cmd="ls ./team"
          lines={[
            <span key="dirs">
              {teachers.map((t, i) => (
                <span key={t.id}>
                  <span className="term-dir">{t.id}/</span>
                  {i < teachers.length - 1 ? "  " : ""}
                </span>
              ))}
            </span>,
          ]}
        />
      </div>
      <div className="grid gap-x-10 gap-y-10 md:grid-cols-2">
        {teachers.map((t) => (
          <Reveal key={t.id} className="min-w-0">
            <article className="flex h-full flex-col border-t border-ink/15 pt-6 text-left">
              <h3 className="text-2xl font-semibold">{t.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-aux">
                {t.roles.join(" · ")}
              </p>
              <p className="mt-4 text-sm leading-[1.75] text-ink">
                研究方向：{t.directions.join("、")}
              </p>
              <p className="mt-3 text-[15px] leading-[1.8] text-body">
                {t.bio}
              </p>
              {t.links.length > 0 && (
                <ul className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-5 text-sm">
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
          </Reveal>
        ))}
      </div>
    </section>
  );
}
