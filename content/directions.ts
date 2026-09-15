import type { DirectionsContent } from "@/lib/types";

/**
 * 研究方向：man directions 手册页（NAME + SEE ALSO 两段）。
 * SEE ALSO 书目用豆瓣稳定条目，Agent 安全链 OWASP 官方 Cheat Sheet，均人工核实（2026-09）。
 */
export const directions: DirectionsContent = {
  entries: [
    {
      id: "kernel",
      name: "内核安全",
      desc: "Linux 内核完整性检测、代码探测感知与控制流保护",
    },
    {
      id: "re",
      name: "软件反编译工程",
      desc: "二进制逆向，寻找安全漏洞或评估软件性能",
    },
    {
      id: "agent",
      name: "Agent 安全",
      desc: "提示注入、记忆投毒、工具滥用、多智能体信任",
    },
    {
      id: "misc",
      name: "其他方向",
      desc: "软件应用开发、OSINT、云计算安全等",
    },
  ],
  seeAlso: [
    {
      label: "《深入理解计算机系统》",
      href: "https://book.douban.com/subject/26912767/",
    },
    {
      label: "《程序员的自我修养——链接、装载与库》",
      href: "https://book.douban.com/subject/3652388/",
    },
    {
      label: "《人月神话》（The Mythical Man-Month）",
      href: "https://book.douban.com/subject/26358448/",
    },
    {
      label: "OWASP AI Agent Security Cheat Sheet",
      href: "https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html",
    },
  ],
};
