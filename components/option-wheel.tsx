"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useReducedMotion } from "motion/react";

type Side = "left" | "right";

type OptionWheelProps = {
  items: string[];
  defaultSelected?: number;
  onChange?: (index: number, item: string) => void;
  textColor?: string;
  activeColor?: string;
  side?: Side;
  fontSize?: number;
  spacing?: number;
  curve?: number;
  tilt?: number;
  blur?: number;
  fade?: number;
  minOpacity?: number;
  smoothing?: number;
  inset?: number;
  loop?: boolean;
  draggable?: boolean;
  className?: string;
  ariaLabel?: string;
};

type WheelConfig = {
  count: number;
  items: string[];
  rowHeight: number;
  curve: number;
  tilt: number;
  blur: number;
  fade: number;
  minOpacity: number;
  side: Side;
  loop: boolean;
  smoothing: number;
  draggable: boolean;
  reducedMotion: boolean;
};

type WheelStyle = CSSProperties & {
  "--ow-text-color": string;
  "--ow-active-color": string;
  "--ow-font-size": string;
  "--ow-inset": string;
};

type WheelItemStyle = CSSProperties & {
  "--ow-progress": string;
};

function getItemPresentation(
  index: number,
  position: number,
  config: WheelConfig,
) {
  let distanceFromSelection = index - position;
  if (config.loop && config.count > 1) {
    distanceFromSelection =
      ((distanceFromSelection % config.count) + config.count) % config.count;
    if (distanceFromSelection > config.count / 2) {
      distanceFromSelection -= config.count;
    }
  }

  const distance = Math.abs(distanceFromSelection);
  const mirror = config.side === "right" ? -1 : 1;
  const tiltRadians = (config.tilt * Math.PI) / 180;
  const radius =
    tiltRadians > 0.0005 ? config.rowHeight / tiltRadians : 0;
  let offsetX = 0;
  let offsetY = distanceFromSelection * config.rowHeight;
  let rotation = 0;

  if (radius > 0) {
    const angle = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, distanceFromSelection * tiltRadians),
    );
    offsetY = radius * Math.sin(angle);
    offsetX = -mirror * radius * (1 - Math.cos(angle)) * config.curve;
    rotation = (mirror * angle * 180) / Math.PI;
  }

  return {
    transform: `translate(${offsetX.toFixed(2)}px, calc(${offsetY.toFixed(2)}px - 50%)) rotate(${rotation.toFixed(3)}deg)`,
    opacity: String(Math.max(config.minOpacity, 1 - distance * config.fade)),
    filter:
      config.blur > 0
        ? `blur(${(distance * config.blur).toFixed(2)}px)`
        : "none",
    progress: Math.max(0, 1 - Math.min(distance, 1)).toFixed(4),
  };
}

/**
 * Curved option selector adapted from React Bits' Option Wheel.
 * Source: https://www.reactbits.dev/components/option-wheel
 */
export function OptionWheel({
  items,
  defaultSelected = 0,
  onChange,
  textColor = "#7d899b",
  activeColor = "#151b26",
  side = "left",
  fontSize = 2.65,
  spacing = 1.25,
  curve = 0.9,
  tilt = 8,
  blur = 0.75,
  fade = 0.22,
  minOpacity = 0.08,
  smoothing = 190,
  inset = 104,
  loop = true,
  draggable = true,
  className = "",
  ariaLabel = "选择教师",
}: OptionWheelProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const positionRef = useRef(defaultSelected);
  const targetRef = useRef(defaultSelected);
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);
  const configRef = useRef<WheelConfig>({} as WheelConfig);
  const onChangeRef = useRef(onChange);
  const selectedRef = useRef(defaultSelected);
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragRef = useRef<{ y: number; start: number; id: number } | null>(null);
  const dragMovedRef = useRef(false);
  const [selectedIndex, setSelectedIndex] = useState(defaultSelected);
  const [isDragging, setIsDragging] = useState(false);
  const reducedMotion = useReducedMotion() ?? false;

  onChangeRef.current = onChange;
  configRef.current = {
    count: items.length,
    items,
    rowHeight: Math.max(fontSize * spacing * 16, 1),
    curve,
    tilt,
    blur,
    fade,
    minOpacity,
    side,
    loop,
    smoothing,
    draggable,
    reducedMotion,
  };

  const runFrame = useCallback((now: number) => {
    const config = configRef.current;
    if (config.count === 0) {
      animationFrameRef.current = null;
      return;
    }

    const deltaTime = Math.min((now - lastFrameRef.current) / 1000, 0.05);
    lastFrameRef.current = now;
    const timeConstant = Math.max(config.smoothing, 1) / 1000;
    const easing = config.reducedMotion
      ? 1
      : 1 - Math.exp(-deltaTime / timeConstant);
    const target = targetRef.current;
    const current = positionRef.current;
    let next = current + (target - current) * easing;
    const settled = Math.abs(target - next) < 0.001;
    if (settled) next = target;
    positionRef.current = next;

    for (let index = 0; index < config.count; index += 1) {
      const element = itemRefs.current[index];
      if (!element) continue;
      const presentation = getItemPresentation(index, next, config);
      element.style.transform = presentation.transform;
      element.style.opacity = presentation.opacity;
      element.style.filter = presentation.filter;
      element.style.setProperty("--ow-progress", presentation.progress);
    }

    animationFrameRef.current = settled
      ? null
      : requestAnimationFrame(runFrame);
  }, []);

  const startAnimation = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    lastFrameRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(runFrame);
  }, [runFrame]);

  const applyTarget = useCallback(
    (value: number, snap: boolean) => {
      const config = configRef.current;
      if (config.count === 0) return;

      let target = value;
      if (!config.loop) {
        target = Math.min(Math.max(target, 0), config.count - 1);
      }
      if (snap) target = Math.round(target);
      targetRef.current = target;

      const index =
        ((Math.round(target) % config.count) + config.count) % config.count;
      if (index !== selectedRef.current) {
        selectedRef.current = index;
        setSelectedIndex(index);
        onChangeRef.current?.(index, config.items[index]);
      }
      startAnimation();
    },
    [startAnimation],
  );

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const config = configRef.current;
      const delta = event.deltaMode === 1 ? event.deltaY * 24 : event.deltaY;
      const step = Math.max(-1, Math.min(1, delta / config.rowHeight));
      applyTarget(targetRef.current + step, false);

      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = setTimeout(
        () => applyTarget(targetRef.current, true),
        140,
      );
    };

    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      element.removeEventListener("wheel", handleWheel);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }, [applyTarget]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!configRef.current.draggable) return;
      dragRef.current = {
        y: event.clientY,
        start: targetRef.current,
        id: event.pointerId,
      };
      dragMovedRef.current = false;
      setIsDragging(true);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag) return;

      const deltaY = event.clientY - drag.y;
      if (!dragMovedRef.current && Math.abs(deltaY) > 4) {
        dragMovedRef.current = true;
        rootRef.current?.setPointerCapture(drag.id);
      }
      if (dragMovedRef.current) {
        applyTarget(
          drag.start - deltaY / configRef.current.rowHeight,
          false,
        );
      }
    },
    [applyTarget],
  );

  const handlePointerEnd = useCallback(() => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setIsDragging(false);
    if (dragMovedRef.current) applyTarget(targetRef.current, true);
  }, [applyTarget]);

  const handleItemClick = useCallback(
    (index: number) => {
      if (dragMovedRef.current) return;
      const config = configRef.current;
      const current = targetRef.current;
      let delta =
        index - (((current % config.count) + config.count) % config.count);

      if (config.loop && config.count > 1) {
        if (delta > config.count / 2) delta -= config.count;
        else if (delta < -config.count / 2) delta += config.count;
      }
      applyTarget(current + delta, true);
    },
    [applyTarget],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      let delta: number | null = null;
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") delta = -1;
      else if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        delta = 1;
      }
      if (delta === null) return;

      event.preventDefault();
      applyTarget(Math.round(targetRef.current) + delta, true);
    },
    [applyTarget],
  );

  useLayoutEffect(() => {
    applyTarget(targetRef.current, false);
  }, [
    items,
    fontSize,
    spacing,
    curve,
    tilt,
    blur,
    fade,
    minOpacity,
    side,
    loop,
    smoothing,
    reducedMotion,
    applyTarget,
  ]);

  useEffect(
    () => () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    },
    [],
  );

  const style: WheelStyle = {
    "--ow-text-color": textColor,
    "--ow-active-color": activeColor,
    "--ow-font-size": `${fontSize}rem`,
    "--ow-inset": `${inset}px`,
  };

  return (
    <div
      ref={rootRef}
      role="listbox"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-activedescendant={`teacher-option-${selectedIndex}`}
      className={`relative h-full w-full touch-none select-none overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }${className ? ` ${className}` : ""}`}
      style={style}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onKeyDown={handleKeyDown}
    >
      {items.map((label, index) => {
        const presentation = getItemPresentation(
          index,
          defaultSelected,
          configRef.current,
        );
        const itemStyle: WheelItemStyle = {
          transform: presentation.transform,
          opacity: Number(presentation.opacity),
          filter: presentation.filter,
          "--ow-progress": presentation.progress,
        };

        return (
          <button
            id={`teacher-option-${index}`}
            key={`${label}-${index}`}
            ref={(element) => {
              itemRefs.current[index] = element;
            }}
            type="button"
            role="option"
            aria-selected={selectedIndex === index}
            tabIndex={-1}
            style={itemStyle}
            className={`absolute top-1/2 cursor-pointer whitespace-nowrap leading-none outline-none will-change-[transform,opacity,filter] [font-size:var(--ow-font-size)] [color:color-mix(in_srgb,var(--ow-active-color)_calc(var(--ow-progress,0)*100%),var(--ow-text-color))] ${
              side === "right"
                ? "right-[var(--ow-inset)] origin-right"
                : "left-[var(--ow-inset)] origin-left"
            } ${selectedIndex === index ? "font-semibold" : "font-light"}`}
            onClick={() => handleItemClick(index)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
