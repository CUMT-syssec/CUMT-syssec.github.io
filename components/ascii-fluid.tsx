"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

const FONT_STACK =
  '"SFMono-Regular", Consolas, "Liberation Mono", ui-monospace, monospace';
const CHARSET = "○>_ ";
const TARGET_FPS = 30;
const FONT_SIZE = 9;
const CELL_PADDING = { x: 1, y: 2 };
const CONTRAST = 2;
const GAMMA = 0.5;
const VIDEO_SRC = "https://cdn.openai.com/ctf-cdn/floral_a.mp4";

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
): GlyphAtlas {
  const scale = 2;
  const tileWidth = Math.max(1, Math.ceil(glyphWidth * scale));
  const tileHeight = Math.max(1, Math.ceil(glyphHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = tileWidth * CHARSET.length;
  canvas.height = tileHeight;
  const context = canvas.getContext("2d");

  if (context) {
    context.scale(scale, scale);
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
  }

  return { canvas, tileWidth, tileHeight };
}

function hashCell(x: number, y: number) {
  const value = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return value - Math.floor(value);
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
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || reducedMotion) return;

    const context = canvas.getContext("2d");
    const sampleCanvas = document.createElement("canvas");
    const sampleContext = sampleCanvas.getContext("2d", {
      willReadFrequently: true,
    });
    if (!context || !sampleContext) return;

    let layout: GridLayout | null = null;
    let field: FluidField | null = null;
    let atlas: GlyphAtlas | null = null;
    let safeArea: LocalRect | null = null;
    let smoothedLuma = new Float32Array(0);
    let lumaInitialized = false;
    let animationFrame = 0;
    let lastFrame = 0;
    let isIntersecting = true;
    let activePointerId: number | null = null;
    let pointerStart: Point | null = null;
    let previousPointer: Point | null = null;
    let dragged = false;
    let videoUnavailable = false;
    const splashes: Splash[] = [];

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

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const glyphWidth = FONT_SIZE / (5 / 3);
      const glyphHeight = FONT_SIZE;
      const cellWidth = glyphWidth + 2 * CELL_PADDING.x;
      const cellHeight = glyphHeight + 2 * CELL_PADDING.y;
      const columns = Math.max(1, Math.floor(rect.width / cellWidth));
      const rows = Math.max(1, Math.floor(rect.height / cellHeight));

      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
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
        padX: CELL_PADDING.x,
        padY: CELL_PADDING.y,
      };
      field = createFluidField(
        Math.round(columns * 0.8),
        Math.round(rows * 0.8),
      );
      sampleCanvas.width = columns;
      sampleCanvas.height = rows;
      atlas = createGlyphAtlas(
        FONT_SIZE,
        glyphWidth,
        glyphHeight,
        window.getComputedStyle(canvas).color,
      );
      smoothedLuma = new Float32Array(columns * rows);
      lumaInitialized = false;
      updateSafeArea();
    };

    const pointerCoordinates = (event: PointerEvent) => {
      if (!layout || !field) return null;
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
      if (!layout || !field) return;
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
        Math.hypot(
          event.clientX - pointerStart.x,
          event.clientY - pointerStart.y,
        ) >= 6
      ) {
        dragged = true;
      }

      if (distance > 0) {
        const scaleX = field.width / layout.width;
        const scaleY = field.height / layout.height;
        const dragBoost = isActivePointer && dragged
          ? Math.min(60, (distance / deltaTime) * 0.03)
          : 0;
        const radiusPx = 28 + dragBoost;
        const radius = radiusPx * Math.min(scaleX, scaleY);

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
      if (event.isPrimary === false || !pointerCoordinates(event)) return;
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
        activePointerId !== event.pointerId ||
        !layout ||
        !field
      ) {
        return;
      }

      const wasClick = !dragged;
      activePointerId = null;
      pointerStart = null;
      previousPointer = null;
      dragged = false;
      if (!wasClick) return;

      const coordinates = pointerCoordinates(event);
      if (!coordinates) return;
      const farthestX = Math.max(coordinates.localX, layout.width - coordinates.localX);
      const farthestY = Math.max(coordinates.localY, layout.height - coordinates.localY);

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
        const travelSpeed = 240 * 3;
        const duration = (splash.maxRadius / travelSpeed) * 1000;
        if (age > duration) continue;

        const progress = clamp01(age / duration);
        const easedProgress = 1 - Math.pow(1 - progress, 2.5);
        const radius = easedProgress * splash.maxRadius;
        const remaining = Math.max(0, 1 - progress);
        const force = 0.5 * 2 * 3 * Math.pow(remaining, 1.2) * 20;
        const densityAmount =
          0.12 * Math.pow(remaining, 2) * clamp(deltaTime / 0.01667, 0.5, 2);

        injectRing(
          field,
          splash.normX * (field.width - 1),
          splash.normY * (field.height - 1),
          force,
          densityAmount,
          radius,
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
      if (video.error) videoUnavailable = true;
      if (!layout || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        if (!videoUnavailable) canvas.dataset.asciiOverlayState = "waiting";
        return null;
      }

      const sourceWidth = video.videoWidth;
      const sourceHeight = video.videoHeight;
      if (!sourceWidth || !sourceHeight) {
        canvas.dataset.asciiOverlayState = "waiting";
        return null;
      }

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

      try {
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
        return sampleContext.getImageData(
          0,
          0,
          layout.columns,
          layout.rows,
        ).data;
      } catch {
        canvas.dataset.asciiOverlayState = "tainted";
        return null;
      }
    };

    const draw = (elapsed: number, deltaTime: number) => {
      if (!layout || !field || !atlas) return;
      context.clearRect(0, 0, layout.width, layout.height);
      const pixels = drawVideoFrame();
      if (!pixels && !videoUnavailable) return;

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
          let targetLuma: number;
          if (pixels) {
            const pixelIndex = lumaIndex * 4;
            targetLuma =
              (0.2126 * pixels[pixelIndex] +
                0.7152 * pixels[pixelIndex + 1] +
                0.0722 * pixels[pixelIndex + 2]) /
              255;
          } else {
            const noise = hashCell(column, row);
            const shimmer =
              0.5 +
              0.5 *
                Math.sin(column * 0.09 + row * 0.13 + elapsed * 0.35);
            targetLuma = clamp01(0.18 + noise * 0.57 + shimmer * 0.25);
          }
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
      canvas.dataset.asciiOverlayState = videoUnavailable
        ? "fallback"
        : "running";
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
    });
    intersectionObserver.observe(canvas);

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerEnd, { passive: true });
    window.addEventListener("pointercancel", handlePointerEnd, { passive: true });
    const handleVideoError = () => {
      videoUnavailable = true;
      canvas.dataset.asciiOverlayState = "fallback";
    };
    video.addEventListener("error", handleVideoError);
    if (video.error) handleVideoError();
    resize();
    canvas.dataset.asciiOverlayState = "ready";

    const startTime = performance.now();
    const render = (now: number) => {
      animationFrame = requestAnimationFrame(render);
      if (!isIntersecting || now - lastFrame < 1000 / TARGET_FPS) return;

      const deltaTime = lastFrame
        ? clamp((now - lastFrame) / 1000, 0.001, 0.1)
        : 1 / TARGET_FPS;
      lastFrame = now;
      if (field) {
        processSplashes(now, deltaTime);
        stepFluid(field, deltaTime);
        draw((now - startTime) / 1000, deltaTime);
      }
    };
    animationFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerEnd);
      window.removeEventListener("pointercancel", handlePointerEnd);
      video.removeEventListener("error", handleVideoError);
    };
  }, [reducedMotion]);

  return (
    <div aria-hidden="true" className={className}>
      <video
        ref={videoRef}
        src={VIDEO_SRC}
        crossOrigin="anonymous"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover object-center"
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
