"use client";

import { useLayoutEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

/**
 * 文化短句翻牌：进入视口时逐字翻转一次（总时长约 0.7—0.9s），随后静止。
 * 中文按整字翻转，不在无关字符之间翻动；不播放声音；不循环。
 * 无 JavaScript 或减少动态效果时直接显示完整短句。
 */
export function FlipLine({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion || !("IntersectionObserver" in window)) return;
    const chars = [...el.querySelectorAll<HTMLElement>("[data-flip-char]")];
    chars.forEach((c) => {
      c.style.opacity = "0";
      c.style.transform = "rotateX(-92deg)";
    });
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        chars.forEach((c, i) => {
          c.style.transition = `transform 0.5s cubic-bezier(0.2, 0.6, 0.2, 1) ${i * 60}ms, opacity 0.3s linear ${i * 60}ms`;
          c.style.transform = "rotateX(0deg)";
          c.style.opacity = "1";
        });
        io.disconnect();
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reducedMotion]);

  return (
    <span ref={ref} className={className} style={{ perspective: 640 }}>
      <span className="sr-only">{text}</span>
      {[...text].map((ch, i) => (
        <span
          key={i}
          aria-hidden
          data-flip-char
          className="inline-block will-change-transform"
          style={{ transformOrigin: "50% 100%", backfaceVisibility: "hidden" }}
        >
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
}
