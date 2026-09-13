import type { Teacher } from "@/lib/types";

/**
 * 主要教师。内容来源见 docs/content-inventory.md。
 * 照片取自其官方教师主页；若不许可使用，删除 public 下图片并将 photo 置空即可。
 */
export const teachers: Teacher[] = [
  {
    id: "li-yonggang",
    name: "李勇钢",
    roles: ["副教授", "硕士生导师", "网络空间安全系主任"],
    directions: ["系统安全与优化", "云计算安全", "虚拟化"],
    bio: "李勇钢，2019 年博士毕业于中国科学技术大学，之后在香港中文大学（深圳）从事博士后研究，并在深圳市人工智能与机器人研究院担任助理研究员。研究聚焦系统安全与优化、云计算安全与虚拟化，围绕内核完整性检测、代码探测感知和闭源软件控制流完整性保护等方向构建了多个安全系统，成果发表于 IEEE S&P、ACM CCS、IEEE TC 等会议与期刊，获 ACM CCS 杰出论文奖、江苏省网络空间安全学会青年科技奖。",
    photo: {
      src: "/images/teachers/liyonggang.png",
      alt: "李勇钢肖像",
    },
    links: [
      {
        label: "学校教师主页",
        href: "https://faculty.cumt.edu.cn/LYG1234/zh_CN/index.htm",
      },
      { label: "邮箱", href: "mailto:liyg@cumt.edu.cn" },
    ],
  },
];
