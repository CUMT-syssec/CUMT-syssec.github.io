import type { CohortOutcomes, Organization } from "@/lib/types";
import { orgName, sortCohorts } from "@/lib/outcomes";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { TermCard } from "./term-card";

/**
 * 学生去向：按毕业届别分行展示。
 * 公开粒度为学校一级（不记名、无人数）；本届申请阶段与往届最终去向区分表达。
 */
export function Outcomes({
  cohorts,
  internshipOrgIds,
  organizations,
}: {
  cohorts: CohortOutcomes[];
  internshipOrgIds: string[];
  organizations: Organization[];
}) {
  const sorted = sortCohorts(cohorts);
  const name = (id: string) => orgName(id, organizations);
  const internships = internshipOrgIds.map(name);

  // 终端条统计：往届去重院校数 / 本届申请中院校数 / 实习企业数
  const finalOrgCount = new Set(
    sorted.filter((c) => c.stage === "final").flatMap((c) => c.orgIds),
  ).size;
  const current = sorted.find((c) => c.stage === "current");
  const summary = `# 往届去向 ${finalOrgCount} 校${
    current ? ` · 本届申请中 ${current.orgIds.length} 校` : ""
  }${internships.length ? ` · 实习 ${internships.length} 家` : ""}`;

  return (
    <section
      id="outcomes"
      aria-labelledby="outcomes-title"
      className="scroll-mt-8"
    >
      <SectionHeading
        id="outcomes-title"
        title="学生去向"
        sub="从这里出发，走向各自的下一站。"
      />

      <div className="mb-10 max-w-[560px] md:mb-12">
        <TermCard
          label="paths"
          cmd="ls ./paths"
          lines={[
            <span key="dirs">
              {sorted.map((c) => (
                <span key={c.cohort} className="term-dir">
                  {c.cohort}/{"  "}
                </span>
              ))}
              {internships.length > 0 && <span className="term-dir">intern/</span>}
            </span>,
            <span key="sum" className="term-dim">
              {summary}
            </span>,
          ]}
        />
      </div>

      <Reveal delay={60}>
        <div className="max-w-[760px] border-t border-ink/10">
          {sorted.map((c) => (
            <div
              key={c.cohort}
              className="grid gap-2 border-b border-ink/10 py-6 md:grid-cols-[150px_1fr] md:gap-6 md:py-7"
            >
              <p className="text-xl font-semibold md:text-2xl">
                {c.cohort} 届
              </p>
              <div className="min-w-0">
                {c.stage === "final" ? (
                  <p className="text-base leading-[1.8] text-ink md:text-[17px]">
                    {c.orgIds.map(name).join("、")}
                  </p>
                ) : (
                  <>
                    <p className="text-base leading-[1.8] text-ink md:text-[17px]">
                      已获得{c.orgIds.map(name).join("、")}的录取 Offer
                    </p>
                    <p className="mt-1.5 text-sm leading-[1.75] text-aux">
                      申请阶段信息，最终去向以实际录取与就读为准。
                    </p>
                  </>
                )}
                {c.note && (
                  <p className="mt-1.5 text-sm leading-[1.75] text-aux">
                    {c.note}
                  </p>
                )}
              </div>
            </div>
          ))}

          {internships.length > 0 && (
            <div className="grid gap-2 border-b border-ink/10 py-6 md:grid-cols-[150px_1fr] md:gap-6 md:py-7">
              <p className="text-xl font-semibold md:text-2xl">实习</p>
              <p className="text-base leading-[1.8] text-body md:text-[17px]">
                实验室同学曾在{internships.join("、")}等企业实习。
              </p>
            </div>
          )}
        </div>
      </Reveal>
    </section>
  );
}
