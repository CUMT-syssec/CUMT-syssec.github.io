import type { SiteInfo } from "@/lib/types";

function formatVerifiedDate(iso: string): string {
  const [y, m] = iso.split("-");
  return `${y} 年 ${Number(m)} 月`;
}

/** 简洁页脚：实验室名称、所属单位、必要外部链接、版权与真实核验时间。 */
export function Footer({ site }: { site: SiteInfo }) {
  const year = site.lastVerified.slice(0, 4);
  return (
    <footer className="border-t border-white/8">
      <div className="mx-auto flex max-w-[880px] flex-col gap-6 px-6 py-10 text-sm text-mist md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-semibold text-snow">
            {site.zhName} · {site.brand}
          </p>
          <p className="mt-1">{site.affiliation}</p>
          <p className="mt-3 text-[13px]">
            © {year} {site.zhName} · 内容最近核验：
            {formatVerifiedDate(site.lastVerified)}
          </p>
        </div>
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
