import type { SiteInfo } from "@/lib/types";
import { AsciiFluid } from "./ascii-fluid";
import { EncryptedText } from "./encrypted-text";
import Aurora from "./Aurora";
import { TextFlip } from "./text-flip";

/**
 * 首屏：品牌立即可读，动效只负责气氛。
 * 内容自上而下：欢迎标题（解密一次）→ 正式中文名 → 研究方向 → 向下了解。
 * 背景：Aurora 极光渐变做底，ASCII 字符流体叠加（鼠标扰动），视频只取亮度不显示。
 */
export function Hero({ site }: { site: SiteInfo }) {
  return (
    <section id="home" className="hero relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-6 text-center text-ink">
      {/* Aurora 极光背景：#0561D1 深蓝 / #ddeeed 浅薄荷 / #5227FF 紫罗兰。
          裁剪器自带合成层（translateZ）：缩放中卡片的圆角才能切实裁掉 WebGL 画布，
          否则合成子层会穿出 border-radius，把角画成直角。 */}
      <div
        aria-hidden
        className="absolute inset-0 overflow-hidden rounded-[inherit] transform-gpu"
      >
        <Aurora
          colorStops={["#0561D1", "#ddeeed", "#5227FF"]}
          amplitude={1}
          blend={0.5}
          lightMode
        />
      </div>
      <AsciiFluid className="hero-ascii-fluid pointer-events-none absolute inset-0 h-full w-full overflow-hidden rounded-[inherit] transform-gpu" />

      <div
        data-fluid-safe-area
        className="hero-content relative mx-auto w-full max-w-[1200px]"
      >
        {/* 终端待输入样式：细光标悬挂在解密文案词尾（不占布局、不破坏居中），
            解密过程即光标前逐字敲入；完成 后光标继续闪烁等待输入。 */}
        <h1 className="brand-settle font-mono text-[clamp(1.5rem,5vw,5.625rem)] leading-[1.15] font-extrabold tracking-[-0.02em] break-words text-brand">
          Welcome to{" "}
          <span className="relative inline-block">
            <EncryptedText text={site.brand} />
            <span
              aria-hidden
              className="terminal-caret absolute left-full top-0 ml-1.5 inline-block h-[1.02em] w-[0.07em] translate-y-[0.06em] bg-brand md:ml-2"
            />
          </span>
        </h1>

        <p className="mt-6 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-2 text-sm leading-relaxed text-body md:mt-8 md:text-base">
          <span>{site.zhName}</span>
          <span>{site.affiliation}</span>
        </p>

        {/* 研究方向轮换展示：交替出现，字母模糊入场呼应解密动效 */}
        <div className="mt-6 flex justify-center md:mt-7">
          <TextFlip words={site.directions} interval={2800} />
        </div>
      </div>

      <a
        href="#directions"
        className="hero-scroll-link absolute bottom-12 inline-flex items-center gap-2 text-sm text-body transition-colors hover:text-accent"
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
