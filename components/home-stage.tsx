"use client";

import { useRef } from "react";
import { useScroll } from "motion/react";
import type { SiteInfo } from "@/lib/types";
import { Hero } from "./hero";
import { useDesktopMotion } from "./use-desktop-motion";

/**
 * 首屏空间结构：首屏是被正文覆盖的底层空间。
 * hm-stage 为相对定位容器；hm-sentinel 是普通绝对定位的 100svh 哨兵
 * （随文档滚动，作为 useScroll 的测量目标；sticky 元素本身的 rect 会被“粘住”，
 * 不能直接当滚动目标）。hm-hero 在桌面端 sticky top-0 z-0，随后的 hm-paper
 * （relative z-10，顶部圆角 + 投影）从它上面滑过——不增加任何滚动距离。
 * 首屏内部的分层视差（网格/柔光/品牌内容）由 Hero 按 scrollYProgress 驱动。
 * 移动端 / 减少动效 / 无 JS：全部回退为普通文档流（sticky 不启用、无视差）。
 */
export function HomeStage({
  site,
  children,
}: {
  site: SiteInfo;
  children: React.ReactNode;
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const active = useDesktopMotion();
  // 进度 0：页面顶部；1：恰好滚过一个首屏高度（纸面完全覆盖首屏）。
  const { scrollYProgress } = useScroll({
    target: sentinelRef,
    offset: ["start start", "end start"],
  });

  return (
    <div className="hm-stage">
      <div ref={sentinelRef} aria-hidden className="hm-sentinel" />

      <div className="hm-hero">
        <Hero site={site} progress={scrollYProgress} active={active} />
      </div>

      <div className="hm-paper bg-paper text-ink">
        <div className="mx-auto max-w-[880px] space-y-[72px] px-6 py-[64px] md:space-y-[112px] md:py-[104px]">
          {children}
        </div>
      </div>
    </div>
  );
}
