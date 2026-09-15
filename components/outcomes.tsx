import type { CohortOutcomes, Organization } from "@/lib/types";
import { orgName, sortCohorts } from "@/lib/outcomes";
import { SectionHeading } from "./section-heading";
import { TermCard } from "./term-card";

/**
 * 学生去向：主副标题在外，届别行收进终端卡片（三列对齐输出）。
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
      <div className="mx-auto max-w-[720px]">
        <TermCard
          label="paths"
          cmd="./outcomes --by cohort"
          lines={[
            ...sorted.map((c) => ({
              node: (
                <span className="t-row">
                  <span className="t-strong">{c.cohort}</span>
                  <span>
                    {c.stage === "final"
                      ? c.orgIds.map(name).join("、")
                      : `${c.orgIds.map(name).join("、")}（已获得 Offer）`}
                  </span>
                  <span className="t-meta">
                    {c.stage === "final" ? "final" : "current"}
                  </span>
                </span>
              ),
            })),
            ...(internships.length
              ? [
                  {
                    node: (
                      <span className="t-row">
                        <span className="t-strong">实习</span>
                        <span className="t-dim">{internships.join("、")}</span>
                        <span className="t-meta">intern</span>
                      </span>
                    ),
                  },
                ]
              : []),
          ]}
        />
      </div>
    </section>
  );
}
