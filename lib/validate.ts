import type {
  Organization,
  Publication,
  SiteInfo,
  Teacher,
  CultureContent,
  CohortOutcomes,
} from "./types";

const URL_RE = /^https:\/\/[^\s]+$/;
const MAILTO_RE = /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function checkLink(href: string, where: string, problems: string[]) {
  if (!URL_RE.test(href) && !MAILTO_RE.test(href)) {
    problems.push(`${where}: 链接 "${href}" 不是有效的 https/mailto 地址（禁止用 # 占位）`);
  }
}

export function validateContent(data: {
  site: SiteInfo;
  teachers: Teacher[];
  outcomeCohorts: CohortOutcomes[];
  internshipOrgIds: string[];
  organizations: Organization[];
  publications: Publication[];
  culture: CultureContent;
}): void {
  const problems: string[] = [];
  const {
    site,
    teachers,
    outcomeCohorts,
    internshipOrgIds,
    organizations,
    publications,
    culture,
  } = data;

  // 站点信息
  if (!site.brand.trim()) problems.push("site.brand 为空");
  if (!site.zhName.trim()) problems.push("site.zhName（正式中文名称）为空");
  if (!site.affiliation.trim()) problems.push("site.affiliation 为空");
  if (site.directions.length < 2 || site.directions.length > 4)
    problems.push("site.directions 应为 2—4 个真实研究方向");
  if (!EMAIL_RE.test(site.email)) problems.push("site.email 格式无效");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(site.lastVerified))
    problems.push("site.lastVerified 应为 YYYY-MM-DD 的真实核验日期");
  site.footerLinks.forEach((l, i) =>
    checkLink(l.href, `site.footerLinks[${i}]`, problems),
  );

  // 教师
  const teacherIds = new Set<string>();
  for (const t of teachers) {
    if (teacherIds.has(t.id)) problems.push(`教师 id 重复: ${t.id}`);
    teacherIds.add(t.id);
    if (!t.name.trim()) problems.push(`教师 ${t.id}: 姓名为空`);
    if (t.roles.length === 0) problems.push(`教师 ${t.id}: 缺少职务/身份`);
    if (t.directions.length === 0) problems.push(`教师 ${t.id}: 缺少研究方向`);
    if (t.bio.trim().length < 50)
      problems.push(`教师 ${t.id}: 简介过短（应回答研究什么、关注什么、指导方向）`);
    t.links.forEach((l, i) => checkLink(l.href, `教师 ${t.id} links[${i}]`, problems));
  }

  // 单位字典
  const orgIds = new Set<string>();
  for (const o of organizations) {
    if (orgIds.has(o.id)) problems.push(`单位 id 重复: ${o.id}`);
    orgIds.add(o.id);
    if (!o.name.trim()) problems.push(`单位 ${o.id}: 名称为空（应使用规范全称）`);
  }

  // 学生去向（按届别聚合到学校一级）
  const currentYear = new Date().getFullYear();
  const cohortSeen = new Set<number>();
  for (const c of outcomeCohorts) {
    if (cohortSeen.has(c.cohort))
      problems.push(`届别 ${c.cohort} 重复（每届最多一条记录）`);
    cohortSeen.add(c.cohort);
    if (
      !Number.isInteger(c.cohort) ||
      c.cohort < 2000 ||
      c.cohort > currentYear + 6
    )
      problems.push(`毕业届别 ${c.cohort} 异常`);
    if (c.stage !== "final" && c.stage !== "current")
      problems.push(`届别 ${c.cohort}: stage 只能是 "final"（往届）或 "current"（本届）`);
    if (c.orgIds.length === 0)
      problems.push(`届别 ${c.cohort}: 去向单位为空`);
    const seen = new Set<string>();
    for (const id of c.orgIds) {
      if (!orgIds.has(id))
        problems.push(`届别 ${c.cohort}: 去向单位 "${id}" 不在单位字典中`);
      if (seen.has(id))
        problems.push(`届别 ${c.cohort}: 单位 "${id}" 同届重复出现`);
      seen.add(id);
    }
  }
  for (const id of internshipOrgIds) {
    if (!orgIds.has(id))
      problems.push(`实习去向单位 "${id}" 不在单位字典中`);
  }

  // 论文
  const pubIds = new Set<string>();
  for (const p of publications) {
    if (pubIds.has(p.id)) problems.push(`论文 id 重复: ${p.id}`);
    pubIds.add(p.id);
    if (!p.title.trim()) problems.push(`论文 ${p.id}: 标题为空`);
    if (p.authors.length === 0) problems.push(`论文 ${p.id}: 作者为空（不得省略作者）`);
    if (!p.venue.trim()) problems.push(`论文 ${p.id}: 缺少发表场所`);
    if (!Number.isInteger(p.year) || p.year < 1990 || p.year > currentYear + 1)
      problems.push(`论文 ${p.id}: 年份 ${p.year} 异常`);
    p.links.forEach((l, i) => checkLink(l.href, `论文 ${p.id} links[${i}]`, problems));
  }

  // 文化
  if (!culture.phrase.trim()) problems.push("culture.phrase 为空");
  if (culture.rules.length < 3 || culture.rules.length > 4)
    problems.push("culture.rules 应为 3—4 条真实机制说明");
  culture.rules.forEach((r, i) => {
    if (!r.title.trim() || !r.body.trim())
      problems.push(`culture.rules[${i}]: 标题或解释为空`);
  });

  if (problems.length > 0) {
    throw new Error(
      `内容校验未通过（${problems.length} 项）:\n - ${problems.join("\n - ")}`,
    );
  }
}
