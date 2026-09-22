export const STATIC_LAYOUT_QUERY =
  "(max-width: 767px), (pointer: coarse), (prefers-reduced-motion: reduce)";

/**
 * Lenis relies on these browser primitives during construction and animation.
 * Older or constrained WebViews use the complete static layout instead of
 * risking a mount-time exception that would blank the React tree.
 */
export function supportsAnimatedLayout(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof window.matchMedia !== "function") return false;
  if (typeof window.ResizeObserver !== "function") return false;
  if (typeof window.requestAnimationFrame !== "function") return false;
  if (typeof window.cancelAnimationFrame !== "function") return false;

  try {
    const query = window.matchMedia(STATIC_LAYOUT_QUERY);
    if (query.matches) return false;
    return (
      typeof query.addEventListener === "function" ||
      typeof query.addListener === "function"
    );
  } catch {
    return false;
  }
}

/** Subscribe on both modern browsers and WebViews with the legacy MQL API. */
export function subscribeMediaQuery(
  query: MediaQueryList,
  listener: () => void,
): () => void {
  if (typeof query.addEventListener === "function") {
    try {
      query.addEventListener("change", listener);
      return () => {
        if (typeof query.removeEventListener === "function") {
          try {
            query.removeEventListener("change", listener);
          } catch {
            // 页面卸载时旧 WebView 可能已释放底层 MQL。
          }
        }
      };
    } catch {
      // 某些 WebView 暴露现代方法但调用会失败，继续尝试旧接口。
    }
  }

  if (typeof query.addListener === "function") {
    try {
      query.addListener(listener);
      return () => {
        if (typeof query.removeListener === "function") {
          try {
            query.removeListener(listener);
          } catch {
            // 页面卸载时旧 WebView 可能已释放底层 MQL。
          }
        }
      };
    } catch {
      // 无可用监听能力时保持当前静态/动画判定即可。
    }
  }

  return () => {};
}
