"use client";

import {
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "motion/react";
import type { SiteInfo } from "@/lib/types";
import { EncryptedText } from "./encrypted-text";
import { TermCard } from "./term-card";

/**
 * 首屏：品牌立即可读，动效只负责气氛。
 * 内容自上而下：欢迎标题（解密一次）→ 正式中文名 → 研究方向 → 向下了解。
 *
 * 可选的滚动视差：传入 progress（父级首屏区块的 scrollYProgress）且 active 时，
 * 网格几乎不动、柔光稍移并淡出、品牌内容最快上移并在被纸面完全覆盖前消失。
 * 未传参（或移动端/减少动效/无 JS）时渲染与原静态首屏完全一致。
 * 注意：spotlight / brand-settle 的入场动画（CSS animation，优先级高于 inline style）
 * 保留在内层元素上，motion 的滚动样式一律挂在外层 wrapper，避免互相覆盖。
 */
export function Hero({
  site,
  progress,
  active = false,
}: {
  site: SiteInfo;
  /** 父级区块的 scrollYProgress（0 页顶 → 1 纸面完全覆盖首屏） */
  progress?: MotionValue<number>;
  /** 桌面端且无减少动效时才挂载滚动联动样式 */
  active?: boolean;
}) {
  // progress 缺省时退化为静止值，保证 hooks 调用顺序恒定
  const fallback = useMotionValue(0);
  const p = progress ?? fallback;
  const gridY = useTransform(p, [0, 1], [0, -12]);
  const spotY = useTransform(p, [0, 1], [0, -30]);
  const spotOpacity = useTransform(p, [0, 0.85], [1, 0]);
  const brandY = useTransform(p, [0, 0.7], [0, -60]);
  const brandOpacity = useTransform(p, [0, 0.55], [1, 0]);

  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-night px-6 py-32 text-center text-snow">
      <motion.div
        aria-hidden
        style={active ? { y: gridY } : undefined}
        className="absolute inset-0 will-change-transform"
      >
        <div aria-hidden className="hero-grid absolute inset-0" />
      </motion.div>
      <motion.div
        aria-hidden
        style={active ? { y: spotY, opacity: spotOpacity } : undefined}
        className="absolute inset-0 will-change-transform"
      >
        <div aria-hidden className="spotlight absolute inset-0" />
      </motion.div>

      <motion.div
        style={active ? { y: brandY, opacity: brandOpacity } : undefined}
        className="relative mx-auto w-full max-w-[1200px] will-change-transform"
      >
        {/* 等宽字体稳定解密字符宽度，窄屏允许自然换行。 */}
        <h1 className="brand-settle font-mono text-[clamp(1.5rem,5vw,5.625rem)] leading-[1.15] font-extrabold tracking-[-0.02em] break-words text-brand">
          <EncryptedText text={site.welcome} />
        </h1>

        <p className="mt-6 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-2 text-sm leading-relaxed text-mist md:mt-8 md:text-base">
          <span>{site.zhName}</span>
          <span>{site.affiliation}</span>
        </p>

        <p className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-mist md:mt-6 md:text-base">
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

        <div className="mx-auto mt-10 max-w-[520px] md:mt-12">
          <TermCard
            dark
            bare
            label="boot"
            cmd="whoami"
            lines={[
              <span key="w" className="term-strong">
                cumt-syssec —— 做真实构建、真实运行的系统安全研究。
              </span>,
            ]}
          />
        </div>
      </motion.div>

      <motion.div
        style={active ? { opacity: brandOpacity } : undefined}
        className="absolute inset-x-0 bottom-10 flex justify-center md:bottom-14"
      >
        <a
          href="#teachers"
          className="inline-flex items-center gap-2 text-sm text-mist transition-colors hover:text-sky"
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
      </motion.div>
    </section>
  );
}
