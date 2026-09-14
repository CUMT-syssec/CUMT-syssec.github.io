import type { SiteInfo } from "@/lib/types";

/**
 * 站点级公开信息。
 * lastVerified 表示内容真实核验时间，人工维护，禁止改成系统日期。
 */
export const site: SiteInfo = {
  brand: "CUMT-SYSSEC",
  welcome: "Welcome to CUMT-SYSSEC",
  zhName: "系统安全实验室",
  affiliation: "中国矿业大学 计算机科学与技术学院/人工智能学院",
  directions: ["系统安全与优化", "虚拟化", "云计算安全", "Agent 安全"],
  email: "liyg@cumt.edu.cn",
  audience: [
    "课题组长期招募优秀博士毕业生",
    "欢迎志在体系结构与系统安全方向研究的研究生加入",
    "也欢迎希望尽早参与科研实践的本科生联系",
  ],
  footerLinks: [
    { label: "学院主页", href: "https://cs.cumt.edu.cn" },
    { label: "GitHub", href: "https://github.com/CUMT-syssec" },
  ],
  lastVerified: "2026-09-13",
};
