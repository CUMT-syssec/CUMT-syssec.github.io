import type {
  CohortOutcomes,
  CultureContent,
  DirectionsContent,
  Organization,
  Publication,
  SiteInfo,
  Teacher,
} from "./types";
import { orgName, sortCohorts } from "./outcomes";
import { sortPublications } from "./publications";

/** 站点对外正式地址（GitHub Pages） */
const SITE_URL = "https://cumt-syssec.github.io";

/**
 * 「AI 的观看」Markdown 源：由 content/ 数据生成，/ai 页面与 /ai.md 端点共用，
 * 人机两个视图同源，内容不会漂移。刻意保持纯 Markdown，不加版式。
 */
export function buildAiMarkdown(data: {
  site: SiteInfo;
  directions: DirectionsContent;
  teachers: Teacher[];
  outcomeCohorts: CohortOutcomes[];
  internshipOrgIds: string[];
  organizations: Organization[];
  publications: Publication[];
  culture: CultureContent;
}): string {
  const {
    site,
    directions,
    teachers,
    outcomeCohorts,
    internshipOrgIds,
    organizations,
    publications,
    culture,
  } = data;
  const name = (id: string) => orgName(id, organizations);

  const teacherLine = (t: Teacher) => {
    const head = t.links[0] ? `[${t.name}](${t.links[0].href})` : t.name;
    return `- ${head} —— ${t.roles.join(" · ")}；方向：${t.directions.join("、")}。${t.bio}`;
  };

  const pubLine = (p: Publication) => {
    const head = p.links[0] ? `[${p.title}](${p.links[0].href})` : p.title;
    const badges = p.badges?.length ? `（${p.badges.join(" · ")}）` : "";
    const authors = p.authors
      .map((a) => `${a.name}${a.corresponding ? "*" : ""}`)
      .join(", ");
    return `- ${head} —— ${p.venue}, ${p.year}${badges}。作者：${authors}`;
  };

  const lines = [
    "---",
    `title: ${site.zhName}（${site.brand}）`,
    `canonical: ${SITE_URL}/ai/`,
    `source: ${SITE_URL}/ai.md`,
    `last-verified: ${site.lastVerified}`,
    "---",
    "",
    `# ${site.zhName}（${site.brand}）`,
    "",
    `> ${site.affiliation}`,
    `> 本页是面向 AI / Agent 的 Markdown 版本；人类阅读请切换 [人类的观看](${SITE_URL}/)。`,
    `> 内容核验时间：${site.lastVerified}`,
    "",
    "## 研究方向",
    "",
    "从 ring 0 到 Agent 层，一路向上。",
    "",
    ...directions.entries.map((d) => `- ${d.name} —— ${d.desc}`),
    "",
    "SEE ALSO:",
    ...directions.seeAlso.map((l) => `- [${l.label}](${l.href})`),
    "",
    "## 主要教师",
    "",
    "认识与你一起做研究的人。",
    "",
    ...teachers.map(teacherLine),
    "",
    "## 学生去向",
    "",
    "按毕业届别聚合到学校一级，不记名、无人数；本届申请阶段与往届最终去向分开标注。",
    "",
    ...sortCohorts(outcomeCohorts).map((c) =>
      c.stage === "final"
        ? `- ${c.cohort} 届（往届最终去向）：${c.orgIds.map(name).join("、")}`
        : `- ${c.cohort} 届（本届申请阶段，已获得 Offer）：${c.orgIds.map(name).join("、")}`,
    ),
    ...(internshipOrgIds.length
      ? ["", `- 实习去向：${internshipOrgIds.map(name).join("、")}`]
      : []),
    "",
    "## 科研成果",
    "",
    "围绕系统安全问题，构建可验证、可落地的研究成果。（* 为通讯作者）",
    "",
    ...sortPublications(publications).map(pubLine),
    "",
    "## 我们如何做研究",
    "",
    `${culture.phrase}${culture.sub}`,
    "",
    ...culture.rules.map((r) => `- ${r.title}：${r.body}`),
    "",
    "## 联系",
    "",
    `- 邮箱：${site.email}`,
    ...site.audience.map((a) => `- ${a}`),
    "",
    "其他链接：",
    ...site.footerLinks.map((l) => `- [${l.label}](${l.href})`),
    "",
  ];
  return lines.join("\n");
}
