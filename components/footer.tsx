import type { SiteInfo } from "@/lib/types";

/** 简洁页脚：居中单行——年份品牌 · 外部链接 · 返回顶部。容器由所在卡片提供。 */
export function Footer({ site }: { site: SiteInfo }) {
  const year = site.lastVerified.slice(0, 4);
  return (
    <footer className="mt-10 border-t border-ink/10 pt-6">
      <div className="flex flex-col items-center justify-center gap-x-5 gap-y-2 text-sm text-aux md:flex-row">
        <p className="whitespace-nowrap">
          @ {year} {site.brand}
        </p>
        <span aria-hidden className="hidden text-ink/20 md:inline">
          ·
        </span>
        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {site.footerLinks.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-accent underline-offset-4 hover:underline"
              >
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#top"
              className="text-aux transition-colors hover:text-ink"
            >
              返回顶部 ↑
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
