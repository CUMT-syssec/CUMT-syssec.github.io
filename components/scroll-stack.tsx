"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import {
  STATIC_LAYOUT_QUERY,
  subscribeMediaQuery,
  supportsAnimatedLayout,
} from "@/lib/motion-support";
import "./scroll-stack.css";

/**
 * ScrollStack（React Bits，https://reactbits.dev 移植的 TS 版，窗口滚动模式）：
 * 每个版块是一张接近全屏的幻灯片卡片；滚动时新卡从下方滑入盖住旧卡，
 * 旧卡按住钉在顶部并轻微缩小，形成层叠牌组（slide-deck）翻页感。
 * 适配本站：
 *  - 仅实现 useWindowScroll 模式（页面级文档滚动）；
 *  - prefers-reduced-motion 时不启用 Lenis 与钉住变换，退化为普通纵向排版；
 *  - 卡片位置用 offsetTop 布局位计算（rect 会受自身变换影响导致反馈抽搐）；
 *  - 嵌套滚动交给 Lenis 的 allowNestedScroll（卡内内容超高时原生滚动）。
 */

export function ScrollStackItem({
  children,
  itemClassName = "",
}: {
  children: ReactNode;
  itemClassName?: string;
}) {
  return (
    <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
  );
}

type ScrollStackProps = {
  children: ReactNode;
  className?: string;
  /** 流式布局里卡片之间的间距（px） */
  itemDistance?: number;
  /** 每张卡片钉住位置的层叠偏移（px），形成牌组错层 */
  itemStackDistance?: number;
  /** 钉住位置：视口高度的百分比 */
  stackPosition?: string;
  /** 缩放动画结束位置：视口高度的百分比（须小于 stackPosition） */
  scaleEndPosition?: string;
  /** 第一张卡片退到牌组深处的目标缩放 */
  baseScale?: number;
  /** 每深一层额外增加的缩放 */
  itemScale?: number;
  scaleDuration?: number;
  rotationAmount?: number;
  blurAmount?: number;
  onStackComplete?: () => void;
};

export default function ScrollStack({
  children,
  className = "",
  itemDistance = 80,
  itemScale = 0.012,
  itemStackDistance = 26,
  stackPosition = "4%",
  scaleEndPosition = "1%",
  baseScale = 0.94,
  scaleDuration = 0.5,
  rotationAmount = 0,
  blurAmount = 0,
  onStackComplete,
}: ScrollStackProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const stackCompletedRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const lastTransformsRef = useRef(
    new Map<number, { translateY: number; scale: number; rotation: number; blur: number }>(),
  );
  const isUpdatingRef = useRef(false);
  // SSR 与 hydration 首帧默认采用完整静态流；确认当前浏览器确实支持后，
  // 桌面端才启用叠卡。脚本失败或旧引擎无法 hydrate 时内容仍可正常滚动。
  const [isCompact, setIsCompact] = useState(true);

  // 窄屏和触屏（包括横屏手机）使用自然文档流：钉住牌组 + 卡内滚动会互相截住，
  // 窄屏内容又普遍超高（单列），滑动体验必然冲突。useLayoutEffect 在绘制前
  // 完成 matchMedia 判定，移动端首帧即流式、无闪烁，SSR 输出保持一致。
  useLayoutEffect(() => {
    if (typeof window.matchMedia !== "function") {
      setIsCompact(true);
      return;
    }
    let mq: MediaQueryList;
    try {
      mq = window.matchMedia(STATIC_LAYOUT_QUERY);
    } catch {
      setIsCompact(true);
      return;
    }
    const update = () => setIsCompact(!supportsAnimatedLayout());
    update();
    return subscribeMediaQuery(mq, update);
  }, []);

  const flowMode = isCompact;

  const calculateProgress = useCallback(
    (scrollTop: number, start: number, end: number) => {
      if (scrollTop <= start) return 0;
      if (scrollTop > end) return 1;
      return (scrollTop - start) / (end - start);
    },
    [],
  );

  const parsePercentage = useCallback((value: string, height: number) => {
    if (typeof value === "string" && value.includes("%")) {
      return (parseFloat(value) / 100) * height;
    }
    return parseFloat(value);
  }, []);

  const updateCardTransforms = useCallback(() => {
    if (!cardsRef.current.length || isUpdatingRef.current) return;

    isUpdatingRef.current = true;

    const scrollTop = window.scrollY;
    const containerHeight = window.innerHeight;
    const stackPositionPx = parsePercentage(stackPosition, containerHeight);
    const scaleEndPositionPx = parsePercentage(
      scaleEndPosition,
      containerHeight,
    );

    // 卡片位置必须用布局位（offsetTop）：getBoundingClientRect 受已应用的
    // translateY/scale 变换影响，用变换后的位置算新变换会形成反馈震荡（抽搐）。
    // scroller 自身不带变换，可安全用 rect 换算文档坐标。
    const scroller = scrollerRef.current;
    if (!scroller) {
      isUpdatingRef.current = false;
      return;
    }
    const scrollerDocTop =
      scroller.getBoundingClientRect().top + window.scrollY;
    const cardTops = cardsRef.current.map(
      (card) => scrollerDocTop + card.offsetTop,
    );

    const endElement = document.querySelector<HTMLElement>(
      ".scroll-stack-end",
    );
    const endElementTop = endElement
      ? scrollerDocTop + endElement.offsetTop
      : 0;

    cardsRef.current.forEach((card, i) => {
      if (!card) return;

      const cardTop = cardTops[i];
      const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;
      const triggerEnd = cardTop - scaleEndPositionPx;
      const pinStart = triggerStart;
      const pinEnd = endElementTop - containerHeight / 2;

      const scaleProgress = calculateProgress(
        scrollTop,
        triggerStart,
        triggerEnd,
      );
      const targetScale = baseScale + i * itemScale;
      const scale = 1 - scaleProgress * (1 - targetScale);
      const rotation = rotationAmount
        ? i * rotationAmount * scaleProgress
        : 0;

      let blur = 0;
      if (blurAmount) {
        let topCardIndex = 0;
        for (let j = 0; j < cardsRef.current.length; j++) {
          const jTriggerStart =
            cardTops[j] - stackPositionPx - itemStackDistance * j;
          if (scrollTop >= jTriggerStart) {
            topCardIndex = j;
          }
        }

        if (i < topCardIndex) {
          const depthInStack = topCardIndex - i;
          blur = Math.max(0, depthInStack * blurAmount);
        }
      }

      let translateY = 0;
      const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;

      if (isPinned) {
        translateY = scrollTop - cardTop + stackPositionPx + itemStackDistance * i;
      } else if (scrollTop > pinEnd) {
        translateY = pinEnd - cardTop + stackPositionPx + itemStackDistance * i;
      }

      const newTransform = {
        // translateY 取整像素：带 will-change 的卡片是独立合成层，Chromium
        // 对合成层的圆角裁剪按整数像素吸附；小数偏移会让圆角在帧间
        // 于圆角/方角之间来回跳变。滚动值本身连续，取整无感知。
        translateY: Math.round(translateY),
        scale: Math.round(scale * 1000) / 1000,
        rotation: Math.round(rotation * 100) / 100,
        blur: Math.round(blur * 100) / 100,
      };

      const lastTransform = lastTransformsRef.current.get(i);
      const hasChanged =
        !lastTransform ||
        Math.abs(lastTransform.translateY - newTransform.translateY) > 0.1 ||
        Math.abs(lastTransform.scale - newTransform.scale) > 0.001 ||
        Math.abs(lastTransform.rotation - newTransform.rotation) > 0.1 ||
        Math.abs(lastTransform.blur - newTransform.blur) > 0.1;

      if (hasChanged) {
        const transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale}) rotate(${newTransform.rotation}deg)`;
        card.style.transform = transform;
        card.style.setProperty("-webkit-transform", transform);
        card.style.filter =
          newTransform.blur > 0 ? `blur(${newTransform.blur}px)` : "";

        lastTransformsRef.current.set(i, newTransform);
      }

      if (i === cardsRef.current.length - 1) {
        const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
        if (isInView && !stackCompletedRef.current) {
          stackCompletedRef.current = true;
          onStackComplete?.();
        } else if (!isInView && stackCompletedRef.current) {
          stackCompletedRef.current = false;
        }
      }
    });

    isUpdatingRef.current = false;
  }, [
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    rotationAmount,
    blurAmount,
    onStackComplete,
    calculateProgress,
    parsePercentage,
  ]);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    // 同步能力检查不能只依赖上一个 effect 的 setState：同一轮 layout
    // effects 仍可能看到旧状态，并在受限 WebView 中误建 Lenis 后直接白屏。
    if (!scroller || flowMode || !supportsAnimatedLayout()) return;

    const cards = Array.from(document.querySelectorAll<HTMLElement>(
      ".scroll-stack-card",
    ));
    cardsRef.current = cards;

    let lenis: Lenis;
    try {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 2,
        wheelMultiplier: 1,
        lerp: 0.1,
        infinite: false,
        syncTouch: true,
        syncTouchLerp: 0.075,
        // 减少动效由外层统一媒体查询处理。关闭 Lenis 内部重复监听，避免其
        // 在仅支持 MediaQueryList.addListener 的旧 WebView 中调用现代 API。
        respectReducedMotion: false,
        // 内容真放不下的卡片允许原生卡内滚动；滚到边界后交回窗口滚动推进牌组。
        // 注意不要用 data-lenis-prevent：那会无条件吞掉滚轮事件，导致屏幕中间完全滚不动。
        allowNestedScroll: true,
      });
    } catch {
      // 某些内嵌 WebView 暴露了 API 却无法正常构造观察器。保留完整内容，
      // 下一次同步渲染切换到自然文档流。
      setIsCompact(true);
      cardsRef.current = [];
      return;
    }

    cards.forEach((card, i) => {
      if (i < cards.length - 1) {
        card.style.marginBottom = `${itemDistance}px`;
      }
      card.style.willChange = "transform, filter";
      card.style.transformOrigin = "top center";
      card.style.backfaceVisibility = "hidden";
    });

    lenis.on("scroll", updateCardTransforms);
    lenisRef.current = lenis;

    // Lenis 接管窗口滚动后，原生锚点跳转会被其内部目标位覆盖；
    // 拦截站内 # 锚点，改由 Lenis 平滑滚到目标（幻灯片钉在 4% 视口处）。
    const handleAnchorClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest?.(
        'a[href^="#"]',
      );
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const hash = anchor.getAttribute("href");
      if (!hash || hash === "#") return;
      let id: string;
      try {
        id = decodeURIComponent(hash.slice(1));
      } catch {
        // 无效百分号编码交回浏览器处理，不能让点击处理器抛异常。
        return;
      }
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      history.pushState(null, "", hash);
      lenis.scrollTo(target as HTMLElement, {
        offset: -window.innerHeight * 0.04,
      });
    };
    document.addEventListener("click", handleAnchorClick);

    const raf = (time: number) => {
      lenis.raf(time);
      animationFrameRef.current = requestAnimationFrame(raf);
    };
    const stopRaf = () => {
      if (animationFrameRef.current === null) return;
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    };
    const startRaf = () => {
      if (animationFrameRef.current !== null || document.hidden) return;
      animationFrameRef.current = requestAnimationFrame(raf);
    };
    const syncVisibility = () => {
      if (document.hidden) stopRaf();
      else startRaf();
    };
    startRaf();
    document.addEventListener("visibilitychange", syncVisibility);
    window.addEventListener("pagehide", stopRaf);
    window.addEventListener("pageshow", startRaf);

    const onResize = () => updateCardTransforms();
    window.addEventListener("resize", onResize);
    updateCardTransforms();

    return () => {
      stopRaf();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", syncVisibility);
      window.removeEventListener("pagehide", stopRaf);
      window.removeEventListener("pageshow", startRaf);
      document.removeEventListener("click", handleAnchorClick);
      lenis.destroy();
      lenisRef.current = null;
      stackCompletedRef.current = false;
      // 模式切换（如窗口跨过窄屏断点）时清掉钉住模式留下的行内样式，
      // 否则残留的 transform/margin 会让流式排版错位。
      cards.forEach((card) => {
        card.style.transform = "";
        card.style.setProperty("-webkit-transform", "");
        card.style.filter = "";
        card.style.marginBottom = "";
        card.style.willChange = "";
        card.style.transformOrigin = "";
        card.style.backfaceVisibility = "";
      });
      cardsRef.current = [];
      lastTransformsRef.current.clear();
      isUpdatingRef.current = false;
    };
  }, [
    flowMode,
    itemDistance,
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    scaleDuration,
    rotationAmount,
    blurAmount,
    onStackComplete,
    updateCardTransforms,
  ]);

  return (
    <div
      ref={scrollerRef}
      className={`scroll-stack-scroller scroll-stack-scroller--window ${
        flowMode ? "scroll-stack-scroller--static " : ""
      }${className}`.trim()}
    >
      <div className="scroll-stack-inner">
        {children}
        {/* 尾部占位：让最后一张卡钉住一段时间后再整体滚出 */}
        <div className="scroll-stack-end" />
      </div>
    </div>
  );
}
