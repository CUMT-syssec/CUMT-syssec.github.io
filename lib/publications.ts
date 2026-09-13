import type { Publication } from "./types";

/** 按正式发表年份从新到旧排序（同年内保持稳定顺序） */
export function sortPublications(pubs: Publication[]): Publication[] {
  return pubs
    .map((pub, index) => ({ pub, index }))
    .sort((a, b) => b.pub.year - a.pub.year || a.index - b.index)
    .map(({ pub }) => pub);
}

export function publicationReference(p: Publication): string {
  const parts: string[] = [p.venue];
  const volIssue = p.volume
    ? p.issue
      ? `${p.volume}(${p.issue})`
      : `Vol. ${p.volume}`
    : null;
  if (volIssue) parts.push(volIssue);
  if (p.pages) parts.push(`pp. ${p.pages}`);
  if (p.articleNumber) parts.push(`Art. ${p.articleNumber}`);
  parts.push(String(p.year));
  return parts.join(", ");
}

export const STATUS_LABEL: Record<Publication["status"], string> = {
  published: "已发表",
  accepted: "已接收",
  preprint: "预印本",
};
