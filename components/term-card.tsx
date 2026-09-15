"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 章节终端卡片：正文全部装进终端，入视口播放一次"敲命令 → 逐行输出"。
 * 默认渲染完整内容（无 JS / 减少动效 / IO 不可用时即为静态终端，内容可读）；
 * 挂载后若允许动效则清空，等进入视口再重放。
 */

export type TermLine = { node: React.ReactNode; cls?: string };

export function TermCard({
  label,
  cmd,
  lines,
  className = "",
}: {
  /** 窗口标题，如 team、paths */
  label: string;
  cmd: string;
  lines: TermLine[];
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
            timers.push(window.setTimeout(type, 24));
          } else {
            let j = 0;
            const show = () => {
              j += 1;
              setShown(j);
              if (j < lines.length) timers.push(window.setTimeout(show, 60));
            };
            timers.push(window.setTimeout(show, 220));
          }
        };
        timers.push(window.setTimeout(type, 180));
      },
      { rootMargin: "0px 0px -14% 0px" },
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
    <div ref={ref} className={`term ${className}`}>
      <div className="term-card">
        <div className="term-head">
          <i className="term-dot term-dot--r" />
          <i className="term-dot term-dot--y" />
          <i className="term-dot term-dot--g" />
          <span className="term-tab">guest@syssec — {label}</span>
          <span className="term-path">~/lab</span>
        </div>
        <div className="term-body">
          <div className="t-l t-cmd">
            <span className="t-prompt">guest@syssec</span>
            <span className="t-dim">:</span>
            <span className="t-tilde">~</span>
            <span className="t-dim">$</span> {cmd.slice(0, cmdLen)}
            {typing && <span className="t-caret" />}
          </div>
          {lines.slice(0, shown).map((l, i) => (
            <div key={i} className={`t-l${l.cls ? ` ${l.cls}` : ""}`}>
              {l.node}
            </div>
          ))}
          {done && (
            <div className="t-l t-cmd">
              <span className="t-prompt">guest@syssec</span>
              <span className="t-dim">:</span>
              <span className="t-tilde">~</span>
              <span className="t-dim">$</span>{" "}
              <span className="t-caret t-caret--blink" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** 终端内的 [ copy ] 按钮（客户端小岛） */
export function TermCopy({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="t-copy"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          /* 剪贴板不可用时静默 */
        }
      }}
    >
      {copied ? "[ copied ✓ ]" : "[ copy ]"}
    </button>
  );
}
