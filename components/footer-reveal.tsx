"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

/**
 * 页脚从下方露出（经典 footer-reveal，渐进增强）。
 * 默认（SSR / 无 JS / 移动端 / 减少动效）：页脚在正常文档流末尾，完整可见。
 * 桌面端 JS 初始化后：量出页脚高度写入 --hm-footer-h 并加 hm-reveal-on 类，
 * 主内容流 margin-bottom 让位、页脚 fixed bottom-0 z-0 垫在主内容（z-1，背景不透明）之下，
 * 滚动到末尾时联系区向上滑开、页脚从下方露出。
 *
 * margin 会减去根元素之后的文档尾部高度，
 * 使露出恰好在滚动到底时完成，总滚动长度与正常流一致。
 * 窗口尺寸与页脚高度变化经 matchMedia + ResizeObserver 重新测量；
 * 卸载时移除类与 CSS 变量，恢复正常流。
 */
export function FooterReveal({
  flow,
  footer,
}: {
  flow: React.ReactNode;
  footer: React.ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    const footerEl = footerRef.current;
    if (!root || !footerEl || reducedMotion) return;

    const mq = window.matchMedia("(min-width: 768px)");
    let enabled = false;

    const measure = () => {
      // 先回到正常流再测量，保证页脚在文档流内、尾部高度准确
      root.classList.remove("hm-reveal-on");
      const footerH = footerEl.offsetHeight;
      const docH = document.scrollingElement?.scrollHeight ?? 0;
      const tail = Math.max(0, docH - (root.offsetTop + root.offsetHeight));
      root.style.setProperty("--hm-footer-h", `${Math.max(0, footerH - tail)}px`);
      root.classList.add("hm-reveal-on");
      enabled = true;
    };
    const disable = () => {
      enabled = false;
      root.classList.remove("hm-reveal-on");
      root.style.removeProperty("--hm-footer-h");
    };
    const apply = () => {
      if (mq.matches) measure();
      else disable();
    };

    apply();
    mq.addEventListener("change", apply);
    const ro = new ResizeObserver(() => {
      if (enabled) measure();
    });
    ro.observe(footerEl);

    return () => {
      enabled = false;
      mq.removeEventListener("change", apply);
      ro.disconnect();
      disable();
    };
  }, [reducedMotion]);

  return (
    <div ref={rootRef} className="hm-reveal-root">
      <div className="hm-flow">{flow}</div>
      <div ref={footerRef} className="hm-footer">
        {footer}
      </div>
    </div>
  );
}
