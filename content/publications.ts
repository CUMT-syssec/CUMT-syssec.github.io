import type { Publication } from "@/lib/types";

/**
 * 论文清单：当前展示实验室指定的 5 篇主要论文（2026-09 实验室确认）。
 * 完整 19 篇著录与来源见 docs/content-inventory.md 及 git 历史，需要恢复时直接补回数组。
 *
 * 作者中 lab:true 表示实验室成员（页面上加粗显示），不靠姓名匹配；
 * 链接只放实际存在的入口。排序由 lib/publications.ts 按正式发表年份自动完成。
 */
export const publications: Publication[] = [
  {
    id: "sp-2026-hotp",
    title: "Poster: A Shadow Verification Method for Hot-patch",
    authors: [
      { name: "Yaoju He", lab: true },
      { name: "Shengyou Chen", lab: true },
      { name: "Yi Guo", lab: true },
      { name: "Ao Ju", lab: true },
      { name: "Yonggang Li", lab: true, corresponding: true },
    ],
    venue: "IEEE Symposium on Security and Privacy (S&P)",
    year: 2026,
    status: "published",
    badges: ["CCF-A"],
    links: [
      {
        kind: "pdf",
        label: "原文 PDF",
        href: "https://sp2026.ieee-security.org/downloads/posters/sp2026posters-final106.pdf",
      },
      {
        kind: "news",
        label: "新闻报道",
        href: "https://cs.cumt.edu.cn/info/1077/7269.htm",
      },
    ],
  },
  {
    id: "cose-2026-driver",
    title:
      "An Unknown Driver Protection Method Based on Multidimensional Domain Switch",
    authors: [
      { name: "Yonggang Li", lab: true },
      { name: "Ao Ju", lab: true },
      { name: "Yi Guo", lab: true },
      { name: "Yu Bao" },
      { name: "Shang Liu" },
      { name: "Yuan Gao" },
    ],
    venue: "Computers & Security",
    year: 2026,
    status: "published",
    volume: "170",
    articleNumber: "105015",
    badges: ["SCI", "CCF-B"],
    links: [
      {
        kind: "page",
        label: "论文页面",
        href: "https://doi.org/10.1016/j.cose.2026.105015",
      },
    ],
  },
  {
    id: "ccs-2024-vbox",
    title: "Isolate and Detect the Untrusted Driver with a Virtual Box",
    authors: [
      { name: "Yonggang Li", lab: true },
      { name: "Shunrong Jiang" },
      { name: "Yu Bao" },
      { name: "Pengpeng Chen" },
      { name: "Yong Zhou" },
      { name: "Yeh-Ching Chung" },
    ],
    venue:
      "ACM SIGSAC Conference on Computer and Communications Security (CCS)",
    year: 2024,
    status: "published",
    pages: "4584-4597",
    badges: ["CCF-A", "杰出论文奖"],
    links: [
      {
        kind: "page",
        label: "论文页面",
        href: "https://doi.org/10.1145/3658644.3670269",
      },
      {
        kind: "news",
        label: "新闻报道",
        href: "https://cs.cumt.edu.cn/info/1071/6044.htm",
      },
    ],
  },
  {
    id: "tc-2024-randomize",
    title: "Randomize the Running Function When It Is Disclosed",
    authors: [
      { name: "Yonggang Li", lab: true },
      { name: "Yu Bao" },
      { name: "Yeh-Ching Chung" },
    ],
    venue: "IEEE Transactions on Computers",
    year: 2024,
    status: "published",
    volume: "73",
    issue: "6",
    pages: "1516-1530",
    badges: ["CCF-A"],
    links: [
      {
        kind: "page",
        label: "论文页面",
        href: "https://doi.org/10.1109/TC.2024.3371776",
      },
    ],
  },
  {
    id: "cjc-2024-cfg",
    title: "一种基于风险代码抽取的控制流保护方法",
    authors: [
      { name: "李勇钢", lab: true },
      { name: "钟叶青" },
      { name: "郑伊健" },
      { name: "林果园" },
      { name: "鲍宇" },
    ],
    venue: "计算机学报",
    year: 2024,
    status: "published",
    badges: ["CCF-A 中文期刊"],
    links: [
      {
        kind: "page",
        label: "论文页面",
        href: "https://faculty.cumt.edu.cn/LYG1234/zh_CN/lwcg/202600/content/152104.htm",
      },
    ],
  },
];
