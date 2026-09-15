/**
 * 「Human / AI」观看方式切换：固定在顶部留白带中央的小药丸。
 * 纯链接实现（无 JS 依赖）：当前视图实心点 ●，另一视图空心点 ○、悬停加深。
 */
export function ViewToggle({ active }: { active: "human" | "ai" }) {
  return (
    <nav aria-label="切换观看方式" className="view-toggle">
      <a
        href="/"
        aria-current={active === "human" ? "page" : undefined}
        className={active === "human" ? "is-active" : undefined}
      >
        {active === "human" ? "●" : "○"} Human
      </a>
      <span aria-hidden className="view-toggle-sep">
        /
      </span>
      <a
        href="/ai/"
        aria-current={active === "ai" ? "page" : undefined}
        className={active === "ai" ? "is-active" : undefined}
      >
        {active === "ai" ? "●" : "○"} AI
      </a>
    </nav>
  );
}
