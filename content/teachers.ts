import type { Teacher } from "@/lib/types";

/** 主要教师：2026-09-13 履历按各条目官方页面核实；职称展示按实验室要求统一为“副教授”。 */
export const teachers: Teacher[] = [
  {
    id: "li-yonggang",
    name: "李勇钢",
    roles: ["副教授", "网络空间安全系主任", "实验室负责人"],
    directions: ["系统安全与优化", "云计算安全", "虚拟化"],
    bio: "中国科学技术大学博士，曾在香港中文大学（深圳）从事博士后研究。围绕内核完整性检测、代码探测感知和控制流保护开展系统安全研究。",
    links: [
      {
        label: "教师主页",
        href: "https://faculty.cumt.edu.cn/LYG1234/zh_CN/index.htm",
      },
    ],
  },
  {
    id: "liu-shang",
    name: "刘上",
    roles: ["副教授", "网络空间安全系副主任"],
    directions: ["隐私安全", "差分隐私", "图分析", "大语言模型"],
    bio: "日本京都大学博士，主要开展隐私安全、差分隐私、图分析与大语言模型相关研究，关注数据分析与智能计算中的隐私保护问题。",
    links: [
      {
        label: "教师主页",
        href: "https://cs.cumt.edu.cn/info/1100/6950.htm",
      },
    ],
  },
  {
    id: "cao-shujiao",
    name: "曹书蛟",
    roles: ["副教授"],
    directions: ["量子密码学", "量子复杂性", "量子安全协议"],
    bio: "本科毕业于中国科学技术大学，博士毕业于中国科学院信息工程研究所。主要研究量子密码学及其理论基础，涉及量子复杂性与量子安全协议。",
    links: [
      {
        label: "教师主页",
        href: "https://cs.cumt.edu.cn/info/1100/6114.htm",
      },
    ],
  },
  {
    id: "ma-zhenguo",
    name: "马振国",
    roles: ["副教授"],
    directions: ["边缘智能网络", "联邦学习"],
    bio: "2023 年获中国科学技术大学计算机学院工学博士学位，主要从事边缘智能网络与联邦学习等领域的研究，关注网络与智能计算的结合。",
    links: [
      {
        label: "教师主页",
        href: "https://faculty.cumt.edu.cn/cs_zgma/zh_CN/index.htm",
      },
    ],
  },
  {
    id: "bao-yu",
    name: "鲍宇",
    roles: ["副教授"],
    directions: ["人工智能与异常检测", "深度学习模型约简", "智能网络安全"],
    bio: "同济大学计算机软件与理论博士，研究涉及人工智能与异常检测、深度学习模型约简、智能网络安全，以及深度可信物联系统。",
    links: [
      {
        label: "教师主页",
        href: "https://faculty.cumt.edu.cn/BY12/zh_CN/index.htm",
      },
    ],
  },
];
