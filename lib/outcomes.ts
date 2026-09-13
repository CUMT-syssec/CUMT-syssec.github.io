import type { CohortOutcomes, Organization } from "./types";

export interface OutcomeStats {
  /** 已公开最终去向涉及的规范化高校数（往届，去重） */
  orgCount: number;
  /** 有公开最终去向的毕业届别数（往届） */
  cohortCount: number;
  /** 最早 / 最晚有公开去向的届别 */
  firstCohort?: number;
  lastCohort?: number;
}

/**
 * 去向统计：与下方届别列表来自同一份公开数据，不维护第二份"宣传数字"。
 * 公开粒度为学校级（无记名、无人数），所以只统计高校数与届别数；
 * 本届申请阶段信息（stage: "current"）不计入。
 */
export function computeOutcomeStats(cohorts: CohortOutcomes[]): OutcomeStats {
  const finalCohorts = cohorts.filter((c) => c.stage === "final");
  const orgIds = new Set(finalCohorts.flatMap((c) => c.orgIds));
  const years = finalCohorts.map((c) => c.cohort).sort((a, b) => a - b);
  return {
    orgCount: orgIds.size,
    cohortCount: years.length,
    firstCohort: years[0],
    lastCohort: years[years.length - 1],
  };
}

/** 按届别从早到晚排序（仅含有公开数据的届别，不补齐空年份） */
export function sortCohorts(cohorts: CohortOutcomes[]): CohortOutcomes[] {
  return [...cohorts].sort((a, b) => a.cohort - b.cohort);
}

export function orgName(id: string, organizations: Organization[]): string {
  return organizations.find((o) => o.id === id)?.name ?? id;
}
