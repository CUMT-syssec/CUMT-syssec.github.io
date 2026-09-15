import { site } from "@/content/site";
import { teachers } from "@/content/teachers";
import { outcomeCohorts, internshipOrgIds } from "@/content/outcomes";
import { organizations } from "@/content/organizations";
import { publications } from "@/content/publications";
import { culture } from "@/content/culture";
import { directions } from "@/content/directions";
import { validateContent } from "./validate";

/**
 * 页面唯一的内容入口。
 * 导入即校验：内容不合法时构建直接失败，不会带着错误内容发布。
 */
validateContent({
  site,
  teachers,
  outcomeCohorts,
  internshipOrgIds,
  organizations,
  publications,
  culture,
  directions,
});

export {
  site,
  teachers,
  outcomeCohorts,
  internshipOrgIds,
  organizations,
  publications,
  culture,
  directions,
};
