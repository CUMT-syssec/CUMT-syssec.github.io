"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*+-<>";

/**
 * 欢迎语解密：只在客户端挂载后播放一次（约 0.8s）。
 * 服务端渲染直接输出最终文案，无 JavaScript 时内容完整；
 * 读屏只读取 sr-only 的完整文案，不逐次播报乱码。
 */
export function EncryptedText({
  text,
  className,
  duration = 800,
}: {
  text: string;
  className?: string;
  /** 总时长（毫秒），方案要求约 0.7—0.9 秒 */
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
      const resolved = Math.floor(progress * 1.4 * text.length);
      setOutput(
        text
          .split("")
          .map((ch, i) => {
            if (ch === " " || i < resolved) return ch;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join(""),
      );
    }, 40);
    return () => clearInterval(timer);
  }, [text, duration, reducedMotion]);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      {/* 等宽字体保证乱码与最终文案同宽，不左右抖动 */}
      <span aria-hidden className="whitespace-nowrap">
        {output}
      </span>
    </span>
  );
}
