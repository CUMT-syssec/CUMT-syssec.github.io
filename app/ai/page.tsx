import type { Metadata } from "next";
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
import { ViewToggle } from "@/components/view-toggle";
import "../term.css";

export const metadata: Metadata = {
  title: "AI 的观看 · 系统安全实验室 CUMT-SYSSEC",
  description:
    "系统安全实验室全部公开内容的 Markdown 版本，面向 AI 与 Agent 阅读；同源文件见 /ai.md。",
};

/**
 * AI 的观看：整页就是一份 Markdown 源文件（与 /ai.md 同源），
 * 白底、等宽、左对齐，无任何动效与装饰。
 */
export default function AiView() {
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

  return (
    <main className="min-h-screen bg-surface text-ink">
      <ViewToggle active="ai" />
      <article className="mx-auto w-full max-w-[780px] px-6 pt-20 pb-24 md:px-8">
        <pre className="ai-md">{md}</pre>
      </article>
    </main>
  );
}
