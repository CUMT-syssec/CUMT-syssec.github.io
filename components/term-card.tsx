"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 章节终端条：滑入视口时自动播放一次"敲命令 → 输出"。
 * 默认渲染完整内容（无 JS / 减少动效 / IO 不可用时即为静态终端）；
 * 挂载后若允许动效则清空，等进入视口再重放——各节内容下方已有完整正文，
 * 本组件为氛围增强，对辅助技术隐藏。
 */
export function TermCard({
  label,
  cmd,
  lines,
  dark = false,
  bare = false,
  className = "",
}: {
  /** 窗口标题，如 team、paths */
  label: string;
  cmd: string;
  lines: React.ReactNode[];
  /** 深色区块（首屏 / 文化 / 联系）使用 */
  dark?: boolean;
  /** 无窗口外框，直接融进背景 */
  bare?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [cmdLen, setCmdLen] = useState(cmd.length);
  const [shown, setShown] = useState(lines.length);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    setCmdLen(0);
    setShown(0);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const timers = timersRef.current;
        let i = 0;
        const type = () => {
          i += 1;
          setCmdLen(Math.min(i, cmd.length));
          if (i < cmd.length) {
            timers.push(window.setTimeout(type, 26));
          } else {
            let j = 0;
            const show = () => {
              j += 1;
              setShown(j);
              if (j < lines.length) timers.push(window.setTimeout(show, 180));
            };
            timers.push(window.setTimeout(show, 200));
          }
        };
        timers.push(window.setTimeout(type, 150));
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
    // 只在挂载时布防一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const typing = cmdLen < cmd.length;
  const done = !typing && shown >= lines.length;

  return (
    <div
      ref={ref}
      aria-hidden
      className={`term${dark ? " term--dark" : ""}${bare ? " term--bare" : ""} ${className}`}
    >
      <div className="term-card">
        {!bare && (
          <div className="term-head">
            <i className="term-dot" />
            <i className="term-dot" />
            <i className="term-dot" />
            <span className="term-tab">guest@syssec — {label}</span>
          </div>
        )}
        <div className="term-body">
          <div className="term-line">
            <span className="term-prompt">guest@syssec</span>
            <span className="term-dim">:</span>
            <span className="term-tilde">~</span>
            <span className="term-dim">$</span> {cmd.slice(0, cmdLen)}
            {typing && <span className="term-caret" />}
          </div>
          {lines.slice(0, shown).map((l, i) => (
            <div key={i} className="term-line term-out">
              {l}
            </div>
          ))}
          {done && (
            <div className="term-line">
              <span className="term-prompt">guest@syssec</span>
              <span className="term-dim">:</span>
              <span className="term-tilde">~</span>
              <span className="term-dim">$</span>{" "}
              <span className="term-caret term-caret--blink" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
