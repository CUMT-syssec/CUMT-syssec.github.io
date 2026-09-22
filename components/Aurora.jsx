"use client";

import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';
import { useEffect, useRef } from 'react';
import { useReducedMotion } from './use-reduced-motion';

import './Aurora.css';

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;
uniform float uLightMode;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ), 
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

struct ColorStop {
  vec3 color;
  float position;
};

#define COLOR_RAMP(colors, factor, finalColor) {              \
  int index = 0;                                            \
  for (int i = 0; i < 2; i++) {                               \
     ColorStop currentColor = colors[i];                    \
     bool isInBetween = currentColor.position <= factor;    \
     index = int(mix(float(index), float(i), float(isInBetween))); \
  }                                                         \
  ColorStop currentColor = colors[index];                   \
  ColorStop nextColor = colors[index + 1];                  \
  float range = nextColor.position - currentColor.position; \
  float lerpFactor = (factor - currentColor.position) / range; \
  finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  
  ColorStop colors[3];
  colors[0] = ColorStop(uColorStops[0], 0.0);
  colors[1] = ColorStop(uColorStops[1], 0.5);
  colors[2] = ColorStop(uColorStops[2], 1.0);
  
  vec3 rampColor;
  COLOR_RAMP(colors, uv.x, rampColor);
  
  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  height = (uv.y * 2.0 - height + 0.2);
  float intensity = 0.6 * height;
  
  float midPoint = 0.20;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);
  
  vec3 auroraColor = intensity * rampColor;
  
  if (uLightMode > 0.5) {
    float energy = clamp(max(intensity, 0.0), 0.0, 1.0);
    float coverage = clamp(auroraAlpha * (0.55 + 0.45 * energy), 0.0, 0.86);
    vec3 chroma = pow(clamp(rampColor, 0.0, 1.0), vec3(1.2));
    float chromaPeak = max(chroma.r, max(chroma.g, chroma.b));
    chroma /= max(chromaPeak, 0.0001);
    fragColor = vec4(mix(vec3(1.0), chroma, min(coverage * 1.08, 0.94)), 1.0);
  } else {
    fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
  }
}
`;

export default function Aurora(props) {
  const { colorStops = ['#5227FF', '#7cff67', '#5227FF'], amplitude = 1.0, blend = 0.5, lightMode = false } = props;
  const propsRef = useRef(props);
  propsRef.current = props;

  const ctnDom = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const ctn = ctnDom.current;
    if (!ctn) return;

    ctn.dataset.auroraState = 'static';

    // A static gradient is cheaper and more reliable for accessibility modes and
    // old embedded browsers that cannot tell us when this card is off-screen.
    if (reducedMotion || !('IntersectionObserver' in window)) return;

    const canvas = document.createElement('canvas');
    const contextAttributes = {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: 'low-power'
    };

    let renderer = null;
    let gl = null;
    let program = null;
    let geometry = null;
    let mesh = null;
    let intersectionObserver = null;
    let resizeObserver = null;
    let animateId = 0;
    let isIntersecting = false;
    let isFailed = false;
    let lastFrameTime = -Infinity;
    let lastCssWidth = 0;
    let lastCssHeight = 0;
    let lastRenderWidth = 0;
    let lastRenderHeight = 0;
    let cachedStops = null;
    let cachedStopColors = null;
    let isTouchDevice = true;
    try {
      isTouchDevice = window.matchMedia?.('(pointer: coarse)').matches ||
        navigator.maxTouchPoints > 0;
    } catch {
      // Keep the smaller frame budget when the capability query is unavailable.
    }
    const minFrameInterval = isTouchDevice ? 1000 / 30 : 0;

    const stopAnimation = () => {
      if (animateId) cancelAnimationFrame(animateId);
      animateId = 0;
    };

    const removeCanvas = () => {
      if (canvas.parentNode === ctn) ctn.removeChild(canvas);
    };

    const disposeGpu = (loseContext = false) => {
      stopAnimation();
      // A lost context already released its GPU objects. Calling deletion APIs on
      // it is both redundant and unreliable in older Android WebViews.
      if (gl && !gl.isContextLost()) {
        geometry?.remove();
        if (program) {
          gl.deleteShader(program.vertexShader);
          gl.deleteShader(program.fragmentShader);
          program.remove();
        }
        if (loseContext) gl.getExtension('WEBGL_lose_context')?.loseContext();
      }
      geometry = null;
      program = null;
      mesh = null;
      removeCanvas();
    };

    const failToStatic = (loseContext = false) => {
      if (isFailed) return;
      isFailed = true;
      ctn.dataset.auroraState = 'failed';
      stopActivity();
      disposeGpu(loseContext);
    };

    const handleContextLost = event => {
      event.preventDefault();
      failToStatic();
    };

    const colorsFor = stops => {
      if (
        cachedStops &&
        cachedStops.length === stops.length &&
        cachedStops.every((stop, index) => stop === stops[index])
      ) {
        return cachedStopColors;
      }
      cachedStops = [...stops];
      cachedStopColors = stops.map(hex => {
        const color = new Color(hex);
        return [color.r, color.g, color.b];
      });
      return cachedStopColors;
    };

    function resize() {
      if (!renderer || !program || isFailed) return false;
      const cssWidth = Math.max(1, Math.round(ctn.clientWidth));
      const cssHeight = Math.max(1, Math.round(ctn.clientHeight));
      if (cssWidth === lastCssWidth && cssHeight === lastCssHeight) return false;

      const scale = Math.min(
        1,
        2048 / cssWidth,
        2048 / cssHeight,
        Math.sqrt(1500000 / (cssWidth * cssHeight))
      );
      const renderWidth = Math.max(1, Math.floor(cssWidth * scale));
      const renderHeight = Math.max(1, Math.floor(cssHeight * scale));

      lastCssWidth = cssWidth;
      lastCssHeight = cssHeight;
      if (renderWidth !== lastRenderWidth || renderHeight !== lastRenderHeight) {
        renderer.setSize(renderWidth, renderHeight);
        lastRenderWidth = renderWidth;
        lastRenderHeight = renderHeight;
        program.uniforms.uResolution.value = [canvas.width, canvas.height];
      }
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
      return true;
    }

    const draw = t => {
      if (!renderer || !program || !mesh || isFailed) return;
      const { time = t * 0.01, speed = 1.0 } = propsRef.current;
      program.uniforms.uTime.value = time * speed * 0.1;
      program.uniforms.uAmplitude.value = propsRef.current.amplitude ?? 1.0;
      program.uniforms.uBlend.value = propsRef.current.blend ?? blend;
      program.uniforms.uLightMode.value = (propsRef.current.lightMode ?? lightMode) ? 1 : 0;
      const stops = propsRef.current.colorStops ?? colorStops;
      program.uniforms.uColorStops.value = colorsFor(stops);
      renderer.render({ scene: mesh });
    };

    const shouldAnimate = () =>
      !isFailed && isIntersecting && !document.hidden;

    const update = t => {
      animateId = 0;
      if (!shouldAnimate()) return;
      if (t - lastFrameTime >= minFrameInterval) {
        try {
          draw(t);
          lastFrameTime = t;
        } catch {
          failToStatic(true);
          return;
        }
      }
      animateId = requestAnimationFrame(update);
    };

    const syncAnimation = () => {
      if (!shouldAnimate()) {
        if (animateId) cancelAnimationFrame(animateId);
        animateId = 0;
        if (!isFailed) ctn.dataset.auroraState = 'paused';
        return;
      }
      ctn.dataset.auroraState = 'running';
      if (!animateId) animateId = requestAnimationFrame(update);
    };

    const handleResize = () => {
      try {
        resize();
      } catch {
        failToStatic(true);
      }
    };

    const handleVisibilityChange = () => {
      syncAnimation();
    };

    function stopActivity() {
      stopAnimation();
      isIntersecting = false;
      intersectionObserver?.disconnect();
      resizeObserver?.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
    }

    try {
      // OGL silently falls back to WebGL 1, but these shaders require GLSL 300.
      // Probe WebGL 2 on the exact canvas that OGL will own and stop early if it
      // is unavailable instead of allowing a later requestAnimationFrame crash.
      gl = canvas.getContext('webgl2', contextAttributes);
      if (!gl) {
        ctn.dataset.auroraState = 'static';
        return;
      }

      renderer = new Renderer({
        canvas,
        webgl: 2,
        ...contextAttributes
      });
      if (!renderer.isWebgl2 || renderer.gl !== gl) throw new Error('WebGL 2 unavailable');

      gl.clearColor(0, 0, 0, 0);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      canvas.style.backgroundColor = 'transparent';

      geometry = new Triangle(gl);
      if (geometry.attributes.uv) delete geometry.attributes.uv;

      program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        transparent: true,
        cullFace: false,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uAmplitude: { value: amplitude },
          uColorStops: { value: colorsFor(colorStops) },
          uResolution: { value: [1, 1] },
          uBlend: { value: blend },
          uLightMode: { value: lightMode ? 1 : 0 }
        }
      });
      if (
        !gl.getShaderParameter(program.vertexShader, gl.COMPILE_STATUS) ||
        !gl.getShaderParameter(program.fragmentShader, gl.COMPILE_STATUS) ||
        !gl.getProgramParameter(program.program, gl.LINK_STATUS)
      ) {
        throw new Error('Aurora shader compilation failed');
      }

      mesh = new Mesh(gl, { geometry, program });
      canvas.addEventListener('webglcontextlost', handleContextLost);
      ctn.appendChild(canvas);

      intersectionObserver = new IntersectionObserver(([entry]) => {
        isIntersecting = entry.isIntersecting;
        syncAnimation();
      });
      intersectionObserver.observe(ctn);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      if ('ResizeObserver' in window) {
        resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(ctn);
      } else {
        window.addEventListener('resize', handleResize);
      }

      resize();
      ctn.dataset.auroraState = 'paused';
    } catch {
      // Releasing the context also cleans up objects from a constructor that
      // threw before it could return an OGL wrapper for explicit disposal.
      failToStatic(true);
    }

    return () => {
      stopActivity();
      disposeGpu(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  return (
    <div
      ref={ctnDom}
      className="aurora-container"
      data-aurora-state="static"
      data-light-mode={lightMode ? 'true' : 'false'}
      style={{
        '--aurora-color-1': colorStops[0],
        '--aurora-color-2': colorStops[1],
        '--aurora-color-3': colorStops[2]
      }}
    />
  );
}
