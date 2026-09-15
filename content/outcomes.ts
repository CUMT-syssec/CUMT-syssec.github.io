import type { CohortOutcomes } from "@/lib/types";

/**
 * 学生去向公开记录（2026-09 实验室提供）。
 * 公开粒度：按毕业届别聚合到学校一级，不记名、无人数。
 *
 * 维护约定：
 * - cohort 一律为"毕业届别"（毕业年份），不混用入学/离组年份；
 * - stage "final" 表示往届毕业时的最终去向；"current" 表示本届申请阶段
 *   （如已获得录取 Offer），页面上与往届区分表达，且不计入顶部统计；
 * - 单位一律用 organizations.ts 里的稳定 id，同届每所院校最多出现一次；
 * - 只有经实验室确认并获准公开的信息才写入本文件——它会完整构建进公开页面。
 *
 * 新一届公开时，在数组末尾追加即可，统计与排版自动更新：
 * { cohort: 2028, stage: "current", orgIds: ["zju"] },
 */
export const outcomeCohorts: CohortOutcomes[] = [
  { cohort: 2024, stage: "final", orgIds: ["pku", "cuhk"] },
  { cohort: 2025, stage: "final", orgIds: ["nju", "hkust-gz", "xmu"] },
  { cohort: 2026, stage: "final", orgIds: ["buaa", "nudt"] },
  { cohort: 2027, stage: "current", orgIds: ["zju", "ustc", "sjtu"] },
];

/** 实习去向：同学曾前往实习的企业（实验室提供） */
export const internshipOrgIds: string[] = ["huawei", "ant", "nsfocus", "state-sec"];
