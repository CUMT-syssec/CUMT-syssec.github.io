import type { DirectionGroup } from "@/lib/types";

/**
 * 研究方向公开陈列（2026-09 实验室确认口径）。
 * 主方向每条配一句话说明；延伸入口只放真实存在、与方向直接相关的链接。
 * site.directions（首屏轮换）与这里的主方向保持一致，改动需两边同步。
 */
export const directionGroups: DirectionGroup[] = [
  {
    title: "研究方向",
    items: [
      {
        id: "kernel",
        name: "内核安全",
        blurb:
          "围绕 Linux 操作系统内核开展完整性检测、代码探测感知与控制流保护研究，需要一定的操作系统与体系结构基础。",
        links: [
          {
            label: "《深入理解计算机系统》（CSAPP）",
            href: "https://book.douban.com/subject/26912767/",
          },
        ],
      },
      {
        id: "re",
        name: "软件反编译工程",
        blurb:
          "二进制逆向与程序分析，覆盖从编译、链接、装载到运行时的完整链条。",
        links: [
          {
            label: "《程序员的自我修养——链接、装载与库》",
            href: "https://book.douban.com/subject/3652388/",
          },
        ],
      },
      {
        id: "agent",
        name: "Agent 安全",
        blurb:
          "大模型与 Agent 时代的系统安全新边界：提示注入、记忆投毒、工具滥用与多智能体信任，当下最受关注的方向。",
        links: [
          {
            label: "OWASP AI Agent Security Cheat Sheet",
            href: "https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html",
          },
        ],
      },
      {
        id: "cloud",
        name: "云计算安全",
        blurb: "云环境下的系统与数据安全，与虚拟化、内核安全一脉相承。",
      },
    ],
  },
  {
    title: "其他研究方向",
    items: [{ id: "appdev", name: "软件应用开发" }, { id: "forensics", name: "计算机取证" }],
  },
  {
    title: "其他方向",
    items: [
      { id: "secdev", name: "软件应用开发安全" },
      { id: "defdev", name: "防护应用开发" },
      { id: "osint", name: "OSINT" },
    ],
  },
];
