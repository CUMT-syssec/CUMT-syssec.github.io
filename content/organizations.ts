import type { Organization } from "@/lib/types";

/**
 * 规范化单位字典。
 * 学生去向通过 orgId 关联到这里，避免"同一学校简称和全称"被统计成两个单位。
 * 新增单位示例：{ id: "cumt", name: "中国矿业大学", kind: "高校" },
 */
export const organizations: Organization[] = [
  { id: "pku", name: "北京大学", kind: "高校" },
  { id: "cuhk", name: "香港中文大学", kind: "高校" },
  { id: "nju", name: "南京大学", kind: "高校" },
  { id: "hkust-gz", name: "香港科技大学（广州）", kind: "高校" },
  { id: "xmu", name: "厦门大学", kind: "高校" },
  { id: "buaa", name: "北京航空航天大学", kind: "高校" },
  { id: "nudt", name: "国防科技大学", kind: "高校" },
  { id: "zju", name: "浙江大学", kind: "高校" },
  { id: "ustc", name: "中国科学技术大学", kind: "高校" },
  { id: "sjtu", name: "上海交通大学", kind: "高校" },
  { id: "huawei", name: "华为", kind: "企业" },
  { id: "ant", name: "蚂蚁集团", kind: "企业" },
  { id: "nsfocus", name: "绿盟科技", kind: "企业" },
  { id: "state-sec", name: "国家相关安全部门" },
];
