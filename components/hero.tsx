import type { SiteInfo } from "@/lib/types";
import { EncryptedText } from "./encrypted-text";

/**
 * 首屏：品牌立即可读，动效只负责气氛。
 * 内容自上而下：欢迎语（解密一次）→ 品牌 → 正式中文名 → 研究方向 → 向下了解。
 */
export function Hero({ site }: { site: SiteInfo }) {
  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-night px-6 py-24 text-center text-snow">
      <div aria-hidden className="hero-grid absolute inset-0" />
      <div aria-hidden className="spotlight absolute inset-0" />

      <div className="relative mx-auto w-full max-w-[1200px]">
        <p className="font-mono text-[13px] tracking-[0.22em] text-mist md:text-sm">
          <EncryptedText text={site.welcome} />
        </p>

        {/* 从首帧就可读，仅做 8px 轻微归位；允许在连字符后自然换行；
            手机端字号控制在 32—44px，桌面 112—144px */}
        <h1 className="brand-settle mt-6 text-[clamp(2rem,11.5vw,2.75rem)] leading-none font-extrabold tracking-[-0.02em] break-words md:text-[clamp(4rem,11.5vw,9rem)]">
          {site.brand}
        </h1>

        <p className="mt-8 text-2xl font-semibold break-words md:text-[2rem]">
          {site.zhName}
        </p>
        <p className="mt-3 text-sm text-mist md:text-base">{site.affiliation}</p>

        <p className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-mist md:text-base">
          {site.directions.map((d, i) => (
            <span key={d} className="flex items-center gap-4">
              {i > 0 && (
                <span aria-hidden className="text-mist/50">
                  ·
                </span>
              )}
              {d}
            </span>
          ))}
        </p>

        <a
          href="#teachers"
          className="mt-16 inline-flex items-center gap-2 text-sm text-mist transition-colors hover:text-sky md:mt-20"
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
      </div>
    </section>
  );
}
