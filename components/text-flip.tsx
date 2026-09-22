"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useReducedMotion } from "./use-reduced-motion";

/**
 * 交替词翻转（React Bits ContainerTextFlip 的站点适配版）：
 * 词组循环播放，字母逐个模糊入场（呼应首屏解密动效）。
 * 无边框无底色，纯文字行，精确居中。
 * prefers-reduced-motion 时静止显示第一个词，不自动轮换。
 */
export function TextFlip({
  words,
  interval = 2800,
  className,
}: {
  words: string[];
  /** 词间隔（毫秒） */
  interval?: number;
  className?: string;
}) {
  const id = useId();
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (
      !container || reducedMotion || words.length <= 1 ||
      typeof IntersectionObserver !== "function"
    ) return;

    let timer: ReturnType<typeof setInterval> | undefined;
    let isIntersecting = false;

    const syncTimer = () => {
      const shouldRun = isIntersecting && !document.hidden;
      if (!shouldRun) {
        if (timer) clearInterval(timer);
        timer = undefined;
        return;
      }
      if (!timer) {
        timer = setInterval(
          () => setIndex((prev) => (prev + 1) % words.length),
          interval,
        );
      }
    };

    let intersectionObserver: IntersectionObserver | null = null;
    try {
      intersectionObserver = new IntersectionObserver(([entry]) => {
        isIntersecting = entry.isIntersecting;
        syncTimer();
      });
      intersectionObserver.observe(container);
    } catch {
      intersectionObserver?.disconnect();
      if (timer) clearInterval(timer);
      return;
    }
    document.addEventListener("visibilitychange", syncTimer);
    syncTimer();

    return () => {
      if (timer) clearInterval(timer);
      intersectionObserver?.disconnect();
      document.removeEventListener("visibilitychange", syncTimer);
    };
  }, [words, interval, reducedMotion]);

  const visibleIndex = reducedMotion ? 0 : index;
  const word = words[visibleIndex] ?? "";

  return (
    <span
      ref={containerRef}
      className={`inline-flex flex-col items-center gap-2 ${className ?? ""}`}
    >
      <span
        aria-hidden
        className="inline-block font-mono text-base font-semibold whitespace-nowrap text-brand md:text-lg"
      >
        {word.split("").map((letter, i) => (
          <span
            key={`${id}-${word}-${i}`}
            style={reducedMotion ? undefined : { animationDelay: `${i * 25}ms` }}
            className={`inline-block${reducedMotion ? "" : " text-flip-letter"}`}
          >
            {letter}
          </span>
        ))}
      </span>

      {/* 轮换进度点：当前方向微亮，其余弱化到背景级 */}
      <span aria-hidden className="flex items-center gap-1.5">
        {words.map((w, i) => (
          <span
            key={w}
            className={`h-1 w-1 rounded-full transition-colors duration-300 ${
              i === visibleIndex ? "bg-brand/60" : "bg-ink/10"
            }`}
          />
        ))}
      </span>

      {/* 读屏与搜索引擎拿到完整方向列表，不依赖轮换 */}
      <span className="sr-only">{words.join("、")}</span>
    </span>
  );
}
