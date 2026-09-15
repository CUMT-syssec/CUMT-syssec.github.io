import {
  culture,
  directions,
  internshipOrgIds,
  organizations,
  outcomeCohorts,
  publications,
  site,
  teachers,
} from "@/lib/content";
import { buildAiMarkdown } from "@/lib/ai-markdown";

/**
 * /ai.md：与「AI 的观看」页面同源的纯 Markdown 文件端点。
 * 静态导出为 out/ai.md，供 Agent 直接抓取（仿 infisical 的 .md 页面惯例）。
 */
export const dynamic = "force-static";

export function GET() {
  const md = buildAiMarkdown({
    site,
    directions,
    teachers,
    outcomeCohorts,
    internshipOrgIds,
    organizations,
    publications,
    culture,
  });
  return new Response(md, {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
