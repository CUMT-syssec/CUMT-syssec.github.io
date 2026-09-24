import type { Announcement } from "@/lib/types";

/** 首页喜报：姓名、学校与拟录取状态由实验室提供并确认公开。 */
export const announcement: Announcement = {
  title: "喜报",
  publishedAt: "2026-09-24",
  statusNote:
    "四位同学已在研招网「推免服务系统」确认接受待录取通知。",
  results: [
    { name: "陈圣友", school: "浙江大学" },
    { name: "贺耀驹", school: "上海交通大学" },
    { name: "刘金昊", school: "厦门大学" },
    { name: "胡创佳", school: "南开大学" },
  ],
};
