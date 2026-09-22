"use client";

import { useEffect, useRef } from "react";

import { subscribeMediaQuery } from "@/lib/motion-support";

const FONT_STACK =
  '"SFMono-Regular", Consolas, "Liberation Mono", ui-monospace, monospace';
const CHARSET = "o>_ ";
const TARGET_FPS = 30;
const FONT_SIZE = 9;
const CELL_PADDING = { x: 1, y: 2 };
const CONTRAST = 2;
const GAMMA = 0.5;
const VIDEO_SRC = "https://cdn.openai.com/ctf-cdn/floral_a.mp4";
const ENHANCEMENT_QUERY =
  "(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
const MAX_BACKBUFFER_PIXELS = 1_500_000;
const MAX_BACKBUFFER_SIDE = 2048;
const MAX_SAMPLE_CELLS = 12_000;

type FluidField = {
  width: number;
  height: number;
  size: number;
  density: Float32Array;
  density0: Float32Array;
  velX: Float32Array;
  velY: Float32Array;
  velX0: Float32Array;
  velY0: Float32Array;
  pressure: Float32Array;
  divergence: Float32Array;
};

type GridLayout = {
  width: number;
  height: number;
  dpr: number;
  columns: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
  glyphWidth: number;
  glyphHeight: number;
  padX: number;
  padY: number;
};

type GlyphAtlas = {
  canvas: HTMLCanvasElement;
  tileWidth: number;
  tileHeight: number;
};

type Point = { x: number; y: number; time: number };

type Splash = {
  normX: number;
  normY: number;
  start: number;
  seed: number;
  maxRadius: number;
  thickness: number;
};

type LocalRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const clamp01 = (value: number) => clamp(value, 0, 1);

const smoothstep = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};

const fieldIndex = (x: number, y: number, width: number) => x + y * width;

function createFluidField(width: number, height: number): FluidField {
  const safeWidth = Math.max(1, Math.floor(width));
  const safeHeight = Math.max(1, Math.floor(height));
  const size = safeWidth * safeHeight;

  return {
    width: safeWidth,
    height: safeHeight,
    size,
    density: new Float32Array(size),
    density0: new Float32Array(size),
    velX: new Float32Array(size),
    velY: new Float32Array(size),
    velX0: new Float32Array(size),
    velY0: new Float32Array(size),
    pressure: new Float32Array(size),
    divergence: new Float32Array(size),
  };
}

function sampleBilinear(
  source: Float32Array,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const safeX = clamp(x, 0, width - 1);
  const safeY = clamp(y, 0, height - 1);
  const x0 = Math.floor(safeX);
  const y0 = Math.floor(safeY);
  const x1 = Math.min(width - 1, x0 + 1);
  const y1 = Math.min(height - 1, y0 + 1);
  const tx = safeX - x0;
  const ty = safeY - y0;
  const topLeft = source[fieldIndex(x0, y0, width)];
  const topRight = source[fieldIndex(x1, y0, width)];
  const bottomLeft = source[fieldIndex(x0, y1, width)];
  const bottomRight = source[fieldIndex(x1, y1, width)];
  const top = topLeft + (topRight - topLeft) * tx;
  const bottom = bottomLeft + (bottomRight - bottomLeft) * tx;

  return top + (bottom - top) * ty;
}

function advect(
  output: Float32Array,
  source: Float32Array,
  velocityX: Float32Array,
  velocityY: Float32Array,
  deltaTime: number,
  width: number,
  height: number,
) {
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = fieldIndex(x, y, width);
      output[index] = sampleBilinear(
        source,
        x - velocityX[index] * deltaTime,
        y - velocityY[index] * deltaTime,
        width,
        height,
      );
    }
  }
}

function diffuse(
  output: Float32Array,
  source: Float32Array,
  amount: number,
  iterations: number,
  width: number,
  height: number,
) {
  output.set(source);
  if (amount <= 0 || iterations <= 0) return;

  const scale = 1 / (1 + 4 * amount);
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = fieldIndex(x, y, width);
        const left = output[fieldIndex(Math.max(0, x - 1), y, width)];
        const right = output[fieldIndex(Math.min(width - 1, x + 1), y, width)];
        const top = output[fieldIndex(x, Math.max(0, y - 1), width)];
        const bottom = output[fieldIndex(x, Math.min(height - 1, y + 1), width)];
        output[index] = (source[index] + amount * (left + right + top + bottom)) * scale;
      }
    }
  }
}

function project(field: FluidField, iterations: number) {
  if (iterations <= 0) return;

  const { width, height, velX, velY, pressure, divergence } = field;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = fieldIndex(x, y, width);
      const left = velX[fieldIndex(Math.max(0, x - 1), y, width)];
      const right = velX[fieldIndex(Math.min(width - 1, x + 1), y, width)];
      const top = velY[fieldIndex(x, Math.max(0, y - 1), width)];
      const bottom = velY[fieldIndex(x, Math.min(height - 1, y + 1), width)];
      divergence[index] = -0.5 * (right - left + bottom - top);
      pressure[index] = 0;
    }
  }

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = fieldIndex(x, y, width);
        const left = pressure[fieldIndex(Math.max(0, x - 1), y, width)];
        const right = pressure[fieldIndex(Math.min(width - 1, x + 1), y, width)];
        const top = pressure[fieldIndex(x, Math.max(0, y - 1), width)];
        const bottom = pressure[fieldIndex(x, Math.min(height - 1, y + 1), width)];
        pressure[index] = (divergence[index] + left + right + top + bottom) / 4;
      }
    }
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = fieldIndex(x, y, width);
      const left = pressure[fieldIndex(Math.max(0, x - 1), y, width)];
      const right = pressure[fieldIndex(Math.min(width - 1, x + 1), y, width)];
      const top = pressure[fieldIndex(x, Math.max(0, y - 1), width)];
      const bottom = pressure[fieldIndex(x, Math.min(height - 1, y + 1), width)];
      velX[index] -= 0.5 * (right - left);
      velY[index] -= 0.5 * (bottom - top);
    }
  }
}

function stepFluid(field: FluidField, deltaTime: number) {
  const {
    width,
    height,
    size,
    velX,
    velY,
    velX0,
    velY0,
    density,
    density0,
  } = field;
  const dt = Math.min(deltaTime, 0.1);

  velX0.set(velX);
  velY0.set(velY);
  diffuse(velX, velX0, 1.5, 5, width, height);
  diffuse(velY, velY0, 1.5, 5, width, height);
  project(field, 10);

  velX0.set(velX);
  velY0.set(velY);
  advect(velX, velX0, velX0, velY0, dt, width, height);
  advect(velY, velY0, velX0, velY0, dt, width, height);
  project(field, 10);

  density0.set(density);
  advect(density, density0, velX, velY, dt, width, height);

  const velocityDecay = Math.exp(-0.1 * dt);
  const densityDecay = Math.exp(-0.1 * dt);
  for (let index = 0; index < size; index += 1) {
    velX[index] *= velocityDecay;
    velY[index] *= velocityDecay;
    density[index] *= densityDecay;
  }
}

function injectPointer(
  field: FluidField,
  centerX: number,
  centerY: number,
  velocityX: number,
  velocityY: number,
  densityAmount: number,
  radius: number,
) {
  if (radius <= 0 || densityAmount <= 0) return;

  const radiusSquared = radius * radius;
  const minX = Math.max(0, Math.floor(centerX - radius));
  const maxX = Math.min(field.width - 1, Math.ceil(centerX + radius));
  const minY = Math.max(0, Math.floor(centerY - radius));
  const maxY = Math.min(field.height - 1, Math.ceil(centerY + radius));

  for (let y = minY; y <= maxY; y += 1) {
    const dy = y - centerY;
    for (let x = minX; x <= maxX; x += 1) {
      const dx = x - centerX;
      const distanceSquared = dx * dx + dy * dy;
      if (distanceSquared > radiusSquared) continue;

      const influence = smoothstep(1 - Math.sqrt(distanceSquared) / radius);
      const index = fieldIndex(x, y, field.width);
      field.velX[index] += velocityX * influence;
      field.velY[index] += velocityY * influence;
      field.density[index] = clamp01(
        field.density[index] + densityAmount * influence,
      );
    }
  }
}

function injectRing(
  field: FluidField,
  centerX: number,
  centerY: number,
  force: number,
  densityAmount: number,
  radiusPx: number,
  thicknessPx: number,
  randomness: number,
  seed: number,
  cellWidthPx: number,
  cellHeightPx: number,
  progress: number,
) {
  if (radiusPx <= 0 || thicknessPx <= 0) return;

  const reach = radiusPx + thicknessPx;
  const radiusX = reach / cellWidthPx;
  const radiusY = reach / cellHeightPx;
  const minX = Math.max(0, Math.floor(centerX - radiusX));
  const maxX = Math.min(field.width - 1, Math.ceil(centerX + radiusX));
  const minY = Math.max(0, Math.floor(centerY - radiusY));
  const maxY = Math.min(field.height - 1, Math.ceil(centerY + radiusY));

  for (let y = minY; y <= maxY; y += 1) {
    const dyPx = (y - centerY) * cellHeightPx;
    for (let x = minX; x <= maxX; x += 1) {
      const dxPx = (x - centerX) * cellWidthPx;
      const distance = Math.hypot(dxPx, dyPx);
      const angle = Math.atan2(dyPx, dxPx);
      const noise =
        0.5 * Math.sin(6 * angle + seed) +
        0.25 * Math.sin(3 * angle + 0.05 * distance + 0.3 * seed) +
        0.5;
      const variation = 0.35 + 0.65 * progress;
      const radiusVariation = clamp(
        1 + randomness * (2 * noise - 1) * variation,
        0.6,
        1.6,
      );
      const distanceFromRing = Math.abs(distance - radiusPx * radiusVariation);
      if (distanceFromRing > thicknessPx) continue;

      const influence = smoothstep(1 - distanceFromRing / thicknessPx);
      const index = fieldIndex(x, y, field.width);
      const strength = clamp(radiusVariation, 0.4, 2.2);

      if (distance > 0 && force !== 0) {
        field.velX[index] += (dxPx / distance) * force * strength * influence;
        field.velY[index] += (dyPx / distance) * force * strength * influence;
      }
      field.density[index] = clamp01(
        field.density[index] + densityAmount * strength * influence,
      );
    }
  }
}

function createGlyphAtlas(
  fontSize: number,
  glyphWidth: number,
  glyphHeight: number,
  color: string,
  dpr: number,
): GlyphAtlas {
  const scale = dpr;
  const tileWidth = Math.max(1, Math.ceil(glyphWidth * scale));
  const tileHeight = Math.max(1, Math.ceil(glyphHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = tileWidth * CHARSET.length;
  canvas.height = tileHeight;
  const context = canvas.getContext("2d");

  if (!context) {
    canvas.width = 1;
    canvas.height = 1;
    throw new Error("ASCII glyph canvas is unavailable");
  }

  context.setTransform(scale, 0, 0, scale, 0, 0);
  context.font = `${fontSize}px ${FONT_STACK}`;
  context.fillStyle = color;
  context.textAlign = "center";
  context.textBaseline = "middle";
  const cssTileWidth = tileWidth / scale;
  const cssTileHeight = tileHeight / scale;

  for (let index = 0; index < CHARSET.length; index += 1) {
    context.fillText(
      CHARSET[index],
      index * cssTileWidth + cssTileWidth / 2,
      cssTileHeight / 2,
    );
  }

  return { canvas, tileWidth, tileHeight };
}

function mapLumaToGlyph(luma: number) {
  let adjusted = clamp01((luma - 0.5) * CONTRAST + 0.5);
  adjusted = Math.pow(adjusted, GAMMA);
  const inverted = 1 - adjusted;
  return clamp(Math.floor(inverted * CHARSET.length), 0, CHARSET.length - 1);
}

function safeAreaFactor(
  safeArea: LocalRect | null,
  x: number,
  y: number,
  fadeSize = 76,
) {
  if (!safeArea) return 1;

  const distanceX =
    x < safeArea.left
      ? safeArea.left - x
      : x > safeArea.right
        ? x - safeArea.right
        : 0;
  const distanceY =
    y < safeArea.top
      ? safeArea.top - y
      : y > safeArea.bottom
        ? y - safeArea.bottom
        : 0;
  const distance = Math.hypot(distanceX, distanceY);

  if (distance === 0) return 0;
  return clamp01(distance / fadeSize);
}

/**
 * Canvas 2D ASCII 流体：速度场负责流动，密度场控制字符显隐。
 * 鼠标悬停/拖动注入流体，轻点后生成向外扩张的环形冲击。
 */
export function AsciiFluid({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || typeof window.matchMedia !== "function") return;

    let mediaQuery: MediaQueryList;
    let connection: (EventTarget & { saveData?: boolean }) | undefined;
    try {
      mediaQuery = window.matchMedia(ENHANCEMENT_QUERY);
      connection = (navigator as Navigator & {
        connection?: EventTarget & { saveData?: boolean };
      }).connection;
    } catch {
      canvas.dataset.asciiOverlayState = "disabled";
      return;
    }
    let stopRuntime: (() => void) | null = null;

    const hasConstrainedDeviceHint = () => {
      const deviceMemory = (
        navigator as Navigator & { deviceMemory?: number }
      ).deviceMemory;
      const hardwareConcurrency = navigator.hardwareConcurrency;
      return (
        connection?.saveData === true ||
        (typeof deviceMemory === "number" &&
          Number.isFinite(deviceMemory) &&
          deviceMemory > 0 &&
          deviceMemory <= 4) ||
        (typeof hardwareConcurrency === "number" &&
          Number.isFinite(hardwareConcurrency) &&
          hardwareConcurrency > 0 &&
          hardwareConcurrency <= 4)
      );
    };

    const startRuntime = (): (() => void) => {
      canvas.dataset.asciiOverlayState = "disabled";
      if (
        !mediaQuery.matches ||
        hasConstrainedDeviceHint() ||
        typeof IntersectionObserver !== "function"
      ) {
        return () => {};
      }

      let maybeContext: CanvasRenderingContext2D | null = null;
      let maybeSampleContext: CanvasRenderingContext2D | null = null;
      const sampleCanvas = document.createElement("canvas");
      try {
        maybeContext = canvas.getContext("2d");
        maybeSampleContext = sampleCanvas.getContext("2d", {
          willReadFrequently: true,
        });
      } catch {
        canvas.dataset.asciiOverlayState = "failed";
        sampleCanvas.width = 1;
        sampleCanvas.height = 1;
        canvas.width = 1;
        canvas.height = 1;
        return () => {};
      }
      if (!maybeContext || !maybeSampleContext) {
        canvas.dataset.asciiOverlayState = "failed";
        sampleCanvas.width = 1;
        sampleCanvas.height = 1;
        canvas.width = 1;
        canvas.height = 1;
        return () => {};
      }
      const context = maybeContext;
      const sampleContext = maybeSampleContext;

      let layout: GridLayout | null = null;
      let field: FluidField | null = null;
      let atlas: GlyphAtlas | null = null;
      let safeArea: LocalRect | null = null;
      let smoothedLuma = new Float32Array(0);
      let lumaInitialized = false;
      let animationFrame = 0;
      let lastFrame = 0;
      let isIntersecting = false;
      let destroyed = false;
      let failed = false;
      let videoRequested = false;
      let playAttempt = 0;
      let activePointerId: number | null = null;
      let pointerStart: Point | null = null;
      let previousPointer: Point | null = null;
      let dragged = false;
      let resizeObserver: ResizeObserver | null = null;
      let intersectionObserver: IntersectionObserver | null = null;
      const splashes: Splash[] = [];

      const isActive = () =>
        !destroyed && !failed && isIntersecting && !document.hidden;

      const resetPointer = () => {
        activePointerId = null;
        pointerStart = null;
        previousPointer = null;
        dragged = false;
      };

      const stopAnimation = () => {
        if (animationFrame) cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        lastFrame = 0;
      };

      const unloadVideo = () => {
        playAttempt += 1;
        try {
          video.pause();
          video.removeAttribute("src");
          video.preload = "none";
          video.load();
        } catch {
          // Cleanup must never escape into the React tree.
        }
        videoRequested = false;
      };

      const releaseBuffers = () => {
        if (atlas) {
          atlas.canvas.width = 1;
          atlas.canvas.height = 1;
        }
        atlas = null;
        layout = null;
        field = null;
        safeArea = null;
        smoothedLuma = new Float32Array(0);
        lumaInitialized = false;
        splashes.length = 0;
        sampleCanvas.width = 1;
        sampleCanvas.height = 1;
        canvas.width = 1;
        canvas.height = 1;
      };

      const updateSafeArea = () => {
        const safeElement = canvas.parentElement?.querySelector<HTMLElement>(
          "[data-fluid-safe-area]",
        );
        if (!safeElement) {
          safeArea = null;
          return;
        }
        const canvasRect = canvas.getBoundingClientRect();
        const elementRect = safeElement.getBoundingClientRect();
        safeArea = {
          left: elementRect.left - canvasRect.left,
          top: elementRect.top - canvasRect.top,
          right: elementRect.right - canvasRect.left,
          bottom: elementRect.bottom - canvasRect.top,
        };
      };

      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        const nativeDpr = Math.max(1, window.devicePixelRatio || 1);
        const dpr = Math.min(
          nativeDpr,
          1.5,
          MAX_BACKBUFFER_SIDE / rect.width,
          MAX_BACKBUFFER_SIDE / rect.height,
          Math.sqrt(MAX_BACKBUFFER_PIXELS / (rect.width * rect.height)),
        );
        const backWidth = Math.max(
          1,
          Math.min(MAX_BACKBUFFER_SIDE, Math.floor(rect.width * dpr)),
        );
        const backHeight = Math.max(
          1,
          Math.min(MAX_BACKBUFFER_SIDE, Math.floor(rect.height * dpr)),
        );
        const snapScale = Math.max(dpr, 0.1);
        const pixel = 1 / snapScale;
        const snap = (value: number, minimum = 0) =>
          Math.max(minimum, Math.round(value * snapScale) / snapScale);
        const glyphWidth = snap(FONT_SIZE / (5 / 3), pixel);
        const glyphHeight = snap(FONT_SIZE, pixel);
        const padX = snap(CELL_PADDING.x);
        const padY = snap(CELL_PADDING.y);
        const baseCellWidth = Math.max(pixel, glyphWidth + 2 * padX);
        const baseCellHeight = Math.max(pixel, glyphHeight + 2 * padY);
        const rawColumns = Math.max(1, Math.floor(rect.width / baseCellWidth));
        const rawRows = Math.max(1, Math.floor(rect.height / baseCellHeight));
        const gridScale = Math.max(
          1,
          Math.sqrt((rawColumns * rawRows) / MAX_SAMPLE_CELLS),
        );
        const columns = Math.max(
          1,
          Math.min(MAX_SAMPLE_CELLS, Math.floor(rawColumns / gridScale)),
        );
        const rows = Math.max(
          1,
          Math.min(
            Math.floor(rawRows / gridScale),
            Math.floor(MAX_SAMPLE_CELLS / columns),
          ),
        );
        const cellWidth = rect.width / columns;
        const cellHeight = rect.height / rows;
        const needsAllocation =
          canvas.width !== backWidth ||
          canvas.height !== backHeight ||
          layout?.columns !== columns ||
          layout?.rows !== rows ||
          !field ||
          !atlas;

        if (canvas.width !== backWidth) canvas.width = backWidth;
        if (canvas.height !== backHeight) canvas.height = backHeight;
        context.setTransform(
          backWidth / rect.width,
          0,
          0,
          backHeight / rect.height,
          0,
          0,
        );
        context.imageSmoothingEnabled = false;

        layout = {
          width: rect.width,
          height: rect.height,
          dpr,
          columns,
          rows,
          cellWidth,
          cellHeight,
          glyphWidth,
          glyphHeight,
          padX,
          padY,
        };
        if (needsAllocation) {
          if (atlas) {
            atlas.canvas.width = 1;
            atlas.canvas.height = 1;
          }
          field = createFluidField(
            Math.max(1, Math.round(columns * 0.8)),
            Math.max(1, Math.round(rows * 0.8)),
          );
          sampleCanvas.width = columns;
          sampleCanvas.height = rows;
          atlas = createGlyphAtlas(
            FONT_SIZE,
            glyphWidth,
            glyphHeight,
            window.getComputedStyle(canvas).color,
            dpr,
          );
          smoothedLuma = new Float32Array(columns * rows);
          lumaInitialized = false;
        }
        updateSafeArea();
      };

      const pointerCoordinates = (event: PointerEvent) => {
        if (!isActive() || !layout || !field) return null;
        const rect = canvas.getBoundingClientRect();
        const localX = event.clientX - rect.left;
        const localY = event.clientY - rect.top;
        if (
          localX < 0 ||
          localY < 0 ||
          localX > rect.width ||
          localY > rect.height
        ) {
          return null;
        }
        return {
          localX,
          localY,
          fieldX: (localX / layout.width) * (field.width - 1),
          fieldY: (localY / layout.height) * (field.height - 1),
        };
      };

      const handlePointerMove = (event: PointerEvent) => {
        if (!isActive() || !layout || !field) return;
        const isActivePointer = activePointerId === event.pointerId;
        if (event.pointerType && event.pointerType !== "mouse" && !isActivePointer) {
          return;
        }
        const coordinates = pointerCoordinates(event);
        if (!coordinates) {
          previousPointer = null;
          return;
        }
        const now = event.timeStamp;
        const previous = previousPointer;
        const deltaX = previous ? event.clientX - previous.x : event.movementX || 0;
        const deltaY = previous ? event.clientY - previous.y : event.movementY || 0;
        const distance = Math.hypot(deltaX, deltaY);
        const deltaTime = previous
          ? clamp((now - previous.time) / 1000, 0.001, 0.05)
          : 0.016;
        if (
          isActivePointer &&
          pointerStart &&
          Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) >= 6
        ) {
          dragged = true;
        }
        if (distance > 0) {
          const scaleX = field.width / layout.width;
          const scaleY = field.height / layout.height;
          const dragBoost = isActivePointer && dragged
            ? Math.min(60, (distance / deltaTime) * 0.03)
            : 0;
          const radius = (28 + dragBoost) * Math.min(scaleX, scaleY);
          injectPointer(
            field,
            coordinates.fieldX,
            coordinates.fieldY,
            (deltaX / deltaTime) * scaleX * 0.5,
            (deltaY / deltaTime) * scaleY * 0.5,
            0.9,
            radius,
          );
        }
        previousPointer = { x: event.clientX, y: event.clientY, time: now };
      };

      const handlePointerDown = (event: PointerEvent) => {
        if (!isActive() || event.isPrimary === false || !pointerCoordinates(event)) {
          return;
        }
        activePointerId = event.pointerId;
        pointerStart = {
          x: event.clientX,
          y: event.clientY,
          time: event.timeStamp,
        };
        previousPointer = pointerStart;
        dragged = false;
      };

      const handlePointerEnd = (event: PointerEvent) => {
        if (
          !isActive() ||
          activePointerId !== event.pointerId ||
          !layout ||
          !field
        ) {
          return;
        }
        const wasClick = !dragged;
        resetPointer();
        if (!wasClick) return;
        const coordinates = pointerCoordinates(event);
        if (!coordinates) return;
        const farthestX = Math.max(
          coordinates.localX,
          layout.width - coordinates.localX,
        );
        const farthestY = Math.max(
          coordinates.localY,
          layout.height - coordinates.localY,
        );
        splashes.push({
          normX: coordinates.fieldX / Math.max(1, field.width - 1),
          normY: coordinates.fieldY / Math.max(1, field.height - 1),
          start: performance.now(),
          seed: Math.random() * 1000,
          maxRadius: Math.min(184, Math.hypot(farthestX, farthestY)),
          thickness: 100,
        });
      };

      const processSplashes = (now: number, deltaTime: number) => {
        if (!layout || !field || splashes.length === 0) return;
        const cellWidthPx = layout.width / Math.max(1, field.width - 1);
        const cellHeightPx = layout.height / Math.max(1, field.height - 1);
        const surviving: Splash[] = [];
        for (const splash of splashes) {
          const age = now - splash.start;
          const duration = (splash.maxRadius / (240 * 3)) * 1000;
          if (age > duration) continue;
          const progress = clamp01(age / duration);
          const easedProgress = 1 - Math.pow(1 - progress, 2.5);
          const remaining = Math.max(0, 1 - progress);
          injectRing(
            field,
            splash.normX * (field.width - 1),
            splash.normY * (field.height - 1),
            0.5 * 2 * 3 * Math.pow(remaining, 1.2) * 20,
            0.12 * Math.pow(remaining, 2) * clamp(deltaTime / 0.01667, 0.5, 2),
            easedProgress * splash.maxRadius,
            splash.thickness,
            0.14,
            splash.seed,
            cellWidthPx,
            cellHeightPx,
            easedProgress,
          );
          surviving.push(splash);
        }
        splashes.splice(0, splashes.length, ...surviving);
      };

      const drawVideoFrame = () => {
        if (!layout || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
          return null;
        }
        const sourceWidth = video.videoWidth;
        const sourceHeight = video.videoHeight;
        if (!sourceWidth || !sourceHeight) return null;
        const sourceAspect = sourceWidth / sourceHeight;
        const destinationAspect = layout.width / layout.height;
        let sourceX = 0;
        let sourceY = 0;
        let cropWidth = sourceWidth;
        let cropHeight = sourceHeight;
        if (sourceAspect > destinationAspect) {
          cropWidth = sourceHeight * destinationAspect;
          sourceX = (sourceWidth - cropWidth) / 2;
        } else {
          cropHeight = sourceWidth / destinationAspect;
          sourceY = (sourceHeight - cropHeight) / 2;
        }
        sampleContext.drawImage(
          video,
          sourceX,
          sourceY,
          cropWidth,
          cropHeight,
          0,
          0,
          layout.columns,
          layout.rows,
        );
        return sampleContext.getImageData(0, 0, layout.columns, layout.rows).data;
      };

      const draw = (pixels: Uint8ClampedArray, deltaTime: number) => {
        if (!layout || !field || !atlas) return;
        context.clearRect(0, 0, layout.width, layout.height);
        const smoothing = lumaInitialized
          ? clamp01(1 - Math.exp(-(deltaTime * 1000) / 1000))
          : 1;
        for (let row = 0; row < layout.rows; row += 1) {
          const fieldY =
            layout.rows > 1
              ? (row / (layout.rows - 1)) * (field.height - 1)
              : 0;
          for (let column = 0; column < layout.columns; column += 1) {
            const fieldX =
              layout.columns > 1
                ? (column / (layout.columns - 1)) * (field.width - 1)
                : 0;
            const flow = clamp01(
              sampleBilinear(
                field.density,
                fieldX,
                fieldY,
                field.width,
                field.height,
              ),
            );
            const lumaIndex = fieldIndex(column, row, layout.columns);
            const pixelIndex = lumaIndex * 4;
            const targetLuma =
              (0.2126 * pixels[pixelIndex] +
                0.7152 * pixels[pixelIndex + 1] +
                0.0722 * pixels[pixelIndex + 2]) /
              255;
            smoothedLuma[lumaIndex] +=
              (targetLuma - smoothedLuma[lumaIndex]) * smoothing;
            const glyphIndex = mapLumaToGlyph(smoothedLuma[lumaIndex] * flow);
            if (CHARSET[glyphIndex] === " ") continue;
            const centerX = (column + 0.5) * layout.cellWidth;
            const centerY = (row + 0.5) * layout.cellHeight;
            const safeFactor = safeAreaFactor(safeArea, centerX, centerY);
            if (safeFactor <= 0) continue;
            context.globalAlpha = safeFactor;
            context.drawImage(
              atlas.canvas,
              glyphIndex * atlas.tileWidth,
              0,
              atlas.tileWidth,
              atlas.tileHeight,
              column * layout.cellWidth + layout.padX,
              row * layout.cellHeight + layout.padY,
              layout.glyphWidth,
              layout.glyphHeight,
            );
          }
        }
        lumaInitialized = true;
        context.globalAlpha = 1;
        canvas.dataset.asciiOverlayState = "running";
      };

      const cleanupListeners = () => {
        resizeObserver?.disconnect();
        intersectionObserver?.disconnect();
        window.removeEventListener("resize", guardedResize);
        document.removeEventListener("visibilitychange", syncActivity);
        window.removeEventListener("pointermove", guardedPointerMove);
        window.removeEventListener("pointerdown", guardedPointerDown);
        window.removeEventListener("pointerup", guardedPointerEnd);
        window.removeEventListener("pointercancel", guardedPointerEnd);
        video.removeEventListener("error", handleVideoError);
        video.removeEventListener("playing", handleVideoPlaying);
      };

      const shutdown = (state?: "failed") => {
        if (destroyed) return;
        destroyed = true;
        failed = state === "failed";
        stopAnimation();
        resetPointer();
        cleanupListeners();
        unloadVideo();
        releaseBuffers();
        if (state) canvas.dataset.asciiOverlayState = state;
      };

      const fail = () => shutdown("failed");

      const render = (now: number) => {
        animationFrame = 0;
        if (!isActive()) return;
        try {
          if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
            canvas.dataset.asciiOverlayState = "waiting";
            return;
          }
          if (now - lastFrame >= 1000 / TARGET_FPS) {
            const deltaTime = lastFrame
              ? clamp((now - lastFrame) / 1000, 0.001, 0.1)
              : 1 / TARGET_FPS;
            lastFrame = now;
            const pixels = drawVideoFrame();
            if (!pixels) {
              canvas.dataset.asciiOverlayState = "waiting";
              return;
            }
            if (field) {
              processSplashes(now, deltaTime);
              stepFluid(field, deltaTime);
              draw(pixels, deltaTime);
            }
          }
          animationFrame = requestAnimationFrame(render);
        } catch {
          fail();
        }
      };

      const startAnimation = () => {
        if (isActive() && !animationFrame) {
          lastFrame = 0;
          animationFrame = requestAnimationFrame(render);
        }
      };

      function handleVideoPlaying() {
        if (!isActive()) return;
        canvas!.dataset.asciiOverlayState = "waiting";
        startAnimation();
      }

      function handleVideoError() {
        fail();
      }

      const pause = () => {
        playAttempt += 1;
        stopAnimation();
        resetPointer();
        try {
          video.pause();
        } catch {
          fail();
          return;
        }
        if (!failed) canvas.dataset.asciiOverlayState = "paused";
      };

      const resume = () => {
        if (!isActive()) return;
        try {
          if (!videoRequested) {
            videoRequested = true;
            video.preload = "auto";
            video.src = VIDEO_SRC;
            video.load();
          }
          canvas.dataset.asciiOverlayState = "waiting";
          const attempt = ++playAttempt;
          const playPromise = video.play();
          if (playPromise) {
            playPromise.catch(() => {
              if (!destroyed && attempt === playAttempt && isActive()) fail();
            });
          }
        } catch {
          fail();
        }
      };

      function syncActivity() {
        if (isActive()) resume();
        else if (!destroyed) pause();
      }

      const guardedResize = () => {
        try {
          resize();
        } catch {
          fail();
        }
      };
      const guardedPointerMove = (event: PointerEvent) => {
        try {
          handlePointerMove(event);
        } catch {
          fail();
        }
      };
      const guardedPointerDown = (event: PointerEvent) => {
        try {
          handlePointerDown(event);
        } catch {
          fail();
        }
      };
      const guardedPointerEnd = (event: PointerEvent) => {
        try {
          handlePointerEnd(event);
        } catch {
          fail();
        }
      };

      try {
        guardedResize();
        if (destroyed) return () => {};
        window.addEventListener("pointermove", guardedPointerMove, { passive: true });
        window.addEventListener("pointerdown", guardedPointerDown, { passive: true });
        window.addEventListener("pointerup", guardedPointerEnd, { passive: true });
        window.addEventListener("pointercancel", guardedPointerEnd, { passive: true });
        video.addEventListener("error", handleVideoError);
        video.addEventListener("playing", handleVideoPlaying);
        document.addEventListener("visibilitychange", syncActivity);
        if (typeof ResizeObserver === "function") {
          resizeObserver = new ResizeObserver(guardedResize);
          resizeObserver.observe(canvas);
        } else {
          window.addEventListener("resize", guardedResize, { passive: true });
        }
        intersectionObserver = new IntersectionObserver(([entry]) => {
          isIntersecting = Boolean(entry?.isIntersecting);
          syncActivity();
        });
        intersectionObserver.observe(canvas);
        canvas.dataset.asciiOverlayState = "paused";
      } catch {
        shutdown("failed");
        return () => {};
      }

      return () => shutdown();
    };

    const syncEligibility = () => {
      stopRuntime?.();
      stopRuntime = startRuntime();
    };
    const unsubscribeMedia = subscribeMediaQuery(mediaQuery, syncEligibility);
    connection?.addEventListener?.("change", syncEligibility);
    syncEligibility();

    return () => {
      unsubscribeMedia();
      connection?.removeEventListener?.("change", syncEligibility);
      stopRuntime?.();
      stopRuntime = null;
    };
  }, []);

  return (
    <div aria-hidden="true" className={className}>
      <video
        ref={videoRef}
        crossOrigin="anonymous"
        loop
        muted
        playsInline
        preload="none"
        /* 背景由 Aurora 极光层提供，视频只取亮度驱动字符，不显示画面 */
        className="hidden"
      />
      <canvas
        ref={canvasRef}
        data-ascii-fluid="true"
        data-ascii-overlay-state="init"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
    </div>
  );
}
