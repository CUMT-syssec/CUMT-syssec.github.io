import type { SiteInfo } from "@/lib/types";
import { AsciiFluid } from "./ascii-fluid";
import { EncryptedText } from "./encrypted-text";
import Aurora from "./Aurora";

/**
 * 首屏：品牌立即可读，动效只负责气氛。
 * 内容自上而下：欢迎标题（解密一次）→ 正式中文名 → 研究方向 → 向下了解。
 * 背景：Aurora 极光渐变做底，ASCII 字符流体叠加（鼠标扰动），视频只取亮度不显示。
 */
export function Hero({ site }: { site: SiteInfo }) {
  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-white px-6 py-32 text-center text-ink">
      {/* Aurora 极光背景：#0561D1 深蓝 / #ddeeed 浅薄荷 / #5227FF 紫罗兰 */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <Aurora
          colorStops={["#0561D1", "#ddeeed", "#5227FF"]}
          amplitude={1}
          blend={0.5}
          lightMode
        />
      </div>
      <AsciiFluid className="hero-ascii-fluid pointer-events-none absolute inset-0 h-full w-full" />

      <div
        data-fluid-safe-area
        className="relative mx-auto w-full max-w-[1200px]"
      >
        {/* “Welcome to ” 直接显示，仅专有名词 brand 跑解密动效。 */}
        <h1 className="brand-settle font-mono text-[clamp(1.5rem,5vw,5.625rem)] leading-[1.15] font-extrabold tracking-[-0.02em] break-words text-[#0561D1]">
          Welcome to <EncryptedText text={site.brand} />
        </h1>

        <p className="mt-6 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-2 text-sm leading-relaxed text-body md:mt-8 md:text-base">
          <span>{site.zhName}</span>
          <span>{site.affiliation}</span>
        </p>

        <p className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-body md:mt-6 md:text-base">
          {site.directions.map((d, i) => (
            <span key={d} className="flex items-center gap-4">
              {i > 0 && (
                <span aria-hidden className="text-body/50">
                  ·
                </span>
              )}
              {d}
            </span>
          ))}
        </p>
      </div>

      <a
        href="#teachers"
        className="absolute bottom-10 inline-flex items-center gap-2 text-sm text-body transition-colors hover:text-accent md:bottom-14"
      >
        向下了解
        <svg
          aria-hidden
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </a>
    </section>
  );
}
