"use client";

import { Fragment, useEffect, useState } from "react";
import { useReducedMotion } from "./use-reduced-motion";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*+-<>";

/**
 * 欢迎语解密：挂载后先保持乱码，再从左到右解密，只播放一次。
 * 服务端渲染直接输出最终文案，无 JavaScript 时内容完整；
 * 读屏只读取 sr-only 的完整文案，不逐次播报乱码。
 */
export function EncryptedText({
  text,
  className,
  duration = 3600,
}: {
  text: string;
  className?: string;
  /** 总时长（毫秒），前六分之一保持乱码。 */
  duration?: number;
}) {
  const [output, setOutput] = useState(text);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setOutput(text);
      return;
    }
    const start = performance.now();
    const timer = setInterval(() => {
      const progress = (performance.now() - start) / duration;
      if (progress >= 1) {
        setOutput(text);
        clearInterval(timer);
        return;
      }
      // 从左到右依次定稿，未定稿字符翻动
      const revealProgress = Math.max(0, (progress - 1 / 6) / (5 / 6));
      const resolved = Math.floor(revealProgress * text.length);
      setOutput(
        text
          .split("")
          .map((ch, i) => {
            if (ch === " " || i < resolved) return ch;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join(""),
      );
    }, 70);
    return () => clearInterval(timer);
  }, [text, duration, reducedMotion]);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      {/* 等宽字体保证乱码与最终文案同宽，不左右抖动 */}
      <span aria-hidden>
        {output.split(" ").map((word, index) => (
          <Fragment key={index}>
            {index > 0 && " "}
            <span className="inline-block whitespace-nowrap">{word}</span>
          </Fragment>
        ))}
      </span>
    </span>
  );
}
