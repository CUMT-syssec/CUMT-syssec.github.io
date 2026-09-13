import type { SiteInfo } from "@/lib/types";

/** 简洁页脚：年份、品牌与必要外部链接。 */
export function Footer({ site }: { site: SiteInfo }) {
  const year = site.lastVerified.slice(0, 4);
  return (
    <footer className="border-t border-white/8">
      <div className="mx-auto flex max-w-[880px] flex-col gap-6 px-6 py-10 text-sm text-mist md:flex-row md:items-start md:justify-between">
        <p>@ {year} {site.brand}</p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {site.footerLinks.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sky underline-offset-4 hover:underline"
              >
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a href="#top" className="text-mist transition-colors hover:text-snow">
              返回顶部 ↑
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
