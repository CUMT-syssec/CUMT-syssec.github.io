/**
 * 公开数据类型定义。
 * 写入 content/ 的所有内容都会被构建进公开页面：
 * 未授权信息不得写入（visible:false 之类的"隐藏"不是隐私保护）。
 */

/** 站点级信息 */
export interface SiteInfo {
  /** 品牌名，首屏大号英文串 */
  brand: string;
  /** 欢迎语（解密动效文案） */
  welcome: string;
  /** 已确认的实验室正式中文名称 */
  zhName: string;
  /** 已确认的所属单位 */
  affiliation: string;
  /** 2—4 个真实研究方向 */
  directions: string[];
  /** 唯一主要联系方式（邮箱） */
  email: string;
  /** 适用人群说明（经确认后填写） */
  audience: string[];
  /** 页脚外部链接 */
  footerLinks: { label: string; href: string }[];
  /** 内容真实核验时间（人工维护，禁止用系统日期冒充） */
  lastVerified: string;
}

export interface ExternalLink {
  label: string;
  href: string;
}

/** 教师 */
export interface Teacher {
  id: string;
  name: string;
  /** 经核实的职务与身份 */
  roles: string[];
  /** 研究方向 */
  directions: string[];
  /** 简介（约 100—160 中文字，左对齐段落） */
  bio: string;
  /** 授权肖像；没有授权照片时置空，版式自动省略 */
  photo?: { src: string; alt: string };
  /** 只放真实存在的入口 */
  links: ExternalLink[];
}

/** 规范化单位（用稳定标识避免简称/全称被统计成两个单位） */
export interface Organization {
  id: string;
  /** 规范全称 */
  name: string;
  /** 如 "高校" "企业" "科研院所" */
  kind?: string;
}

/**
 * 学生去向公开记录：按毕业届别聚合到学校一级，不记名、无人数。
 * 这是实验室选择的公开粒度，比逐生记录更注重隐私。
 */
export interface CohortOutcomes {
  /** 毕业届别 = 毕业年份（统一口径，禁止混用入学/离组年份） */
  cohort: number;
  /**
   * final  = 往届：毕业或离组时的最终去向（不代表几年后的现职）；
   * current = 本届：申请阶段信息（如已获得录取 Offer），不计入最终去向统计，
   *           页面上与往届明确区分表达。
   */
  stage: "final" | "current";
  /** 去向单位（organizations.ts 的稳定 id）；同届每所院校最多出现一次 */
  orgIds: string[];
  /** 必要补充说明 */
  note?: string;
}

export type PublicationStatus = "published" | "accepted" | "preprint";

export interface Author {
  name: string;
  /** 实验室成员标识（加粗显示）；禁止靠姓名子串匹配 */
  lab?: boolean;
  /** 通讯作者标记只在来源明确时使用 */
  corresponding?: boolean;
}

export type PublicationLinkKind =
  | "page"
  | "pdf"
  | "code"
  | "project"
  | "bibtex"
  | "news";

export interface Publication {
  id: string;
  /** 正式标题，完整显示，不截断 */
  title: string;
  /** 完整作者顺序 */
  authors: Author[];
  /** 会议或期刊名称 */
  venue: string;
  /** 正式发表年份 */
  year: number;
  status: PublicationStatus;
  volume?: string;
  issue?: string;
  pages?: string;
  articleNumber?: string;
  /** 来源明确的标注，如 "CCF-A"、"杰出论文奖" */
  badges?: string[];
  /** 只放实际存在的链接 */
  links: { kind: PublicationLinkKind; label: string; href: string }[];
}

/** 实验室文化 */
export interface CultureContent {
  /** 翻牌核心短句（已确认） */
  phrase: string;
  /** 解释方向短句 */
  sub: string;
  /** 真实机制说明：短标题 + 一两句具体解释 */
  rules: { title: string; body: string }[];
}
