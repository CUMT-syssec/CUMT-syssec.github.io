"use client";

import { useEffect, useState } from "react";

/**
 * 复制邮箱（可选增强）。
 * 复制失败时明确提示失败，绝不误报"已复制"；
 * 无 JavaScript 时不渲染按钮，邮箱文字本身可直接选择复制。
 */
export function CopyEmail({ email }: { email: string }) {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<"idle" | "ok" | "fail">("idle");

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setState("ok");
    } catch {
      setState("fail");
    }
    window.setTimeout(() => setState("idle"), 2600);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 px-4 py-1.5 text-sm text-accent transition-colors hover:border-accent hover:text-ink"
      aria-live="polite"
    >
      {state === "ok" ? "已复制" : state === "fail" ? "复制失败，请手动复制" : "复制邮箱"}
    </button>
  );
}
