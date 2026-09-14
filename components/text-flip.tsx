"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useState } from "react";

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

  useEffect(() => {
    if (reducedMotion) return;
    const timer = setInterval(
      () => setIndex((prev) => (prev + 1) % words.length),
      interval,
    );
    return () => clearInterval(timer);
  }, [words, interval, reducedMotion]);

  const word = words[index] ?? "";

  return (
    <span
      className={`inline-flex flex-col items-center gap-2 ${className ?? ""}`}
    >
      <span
        aria-hidden
        className="inline-block font-mono text-base font-semibold whitespace-nowrap text-brand md:text-lg"
      >
        {word.split("").map((letter, i) => (
          <motion.span
            key={`${id}-${word}-${i}`}
            initial={{ opacity: 0, filter: "blur(8px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ delay: i * 0.025, duration: 0.3 }}
            className="inline-block"
          >
            {letter}
          </motion.span>
        ))}
      </span>

      {/* 轮换进度点：当前方向微亮，其余弱化到背景级 */}
      <span aria-hidden className="flex items-center gap-1.5">
        {words.map((w, i) => (
          <span
            key={w}
            className={`h-1 w-1 rounded-full transition-colors duration-300 ${
              i === index ? "bg-brand/60" : "bg-ink/10"
            }`}
          />
        ))}
      </span>

      {/* 读屏与搜索引擎拿到完整方向列表，不依赖轮换 */}
      <span className="sr-only">{words.join("、")}</span>
    </span>
  );
}
