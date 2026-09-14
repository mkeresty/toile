"use client";
/* eslint-disable @next/next/no-img-element -- exact full-canvas source layers are required */

import { animate, stagger } from "motion";
import { useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { TOILE_SCENE } from "@/lib/toile-scene";

type Bounds = { left: number; top: number; width: number; height: number };
type AnimatedLayer = {
  id: string;
  src: string;
  contourSrc: string;
  bounds: Bounds;
  animationDelay: number;
  scrollSpeed: number;
  drawOrder: number;
};
type DepthProfile = {
  zoom: number;
  y: number;
  x: number;
  pointer: number;
  rotate: number;
};

const depthProfiles: Record<string, DepthProfile> = {
  water: { zoom: 0.06, y: -0.008, x: 0, pointer: 1.5, rotate: 0 },
  "left-land-underlay": { zoom: 0.095, y: -0.012, x: 0.006, pointer: 3, rotate: -0.05 },
  "left-gap-bushes": { zoom: 0.095, y: -0.012, x: 0.006, pointer: 3.5, rotate: -0.05 },
  mountains: { zoom: 0.06, y: -0.008, x: 0, pointer: 1, rotate: 0 },
  "background-village": { zoom: 0.06, y: -0.008, x: 0, pointer: 2, rotate: 0 },
  boat: { zoom: 0.085, y: -0.018, x: -0.004, pointer: 4, rotate: 0.08 },
  "main-villa": { zoom: 0.11, y: -0.022, x: 0.008, pointer: 4.5, rotate: -0.04 },
  "left-wall": { zoom: 0.15, y: 0.004, x: 0.012, pointer: 6, rotate: -0.08 },
  "foreground-plants": { zoom: 0.22, y: 0.025, x: -0.012, pointer: 9, rotate: 0.12 },
};

const introDelays: Record<string, number> = {
  mountains: 0,
  "background-village": 0.28,
  "main-villa": 0.56,
  "foreground-plants": 0.82,
  "left-wall": 1.08,
  water: 1.3,
  "left-land-underlay": 1.5,
  "left-gap-bushes": 1.72,
  boat: 1.9,
};

function smoothstep(value: number) {
  const clamped = Math.min(1, Math.max(0, value));
  return clamped * clamped * (3 - 2 * clamped);
}

function AnimatedParallaxLayer({
  layer,
  contourMarkup,
  startAt,
}: {
  layer: AnimatedLayer;
  contourMarkup: string;
  startAt: number;
}) {
  const contourRef = useRef<SVGGElement>(null);
  const pngRef = useRef<SVGImageElement>(null);
  const reducedMotion = useReducedMotion();
  const profile = depthProfiles[layer.id];

  useLayoutEffect(() => {
    const contour = contourRef.current;
    const png = pngRef.current;
    if (!contour || !png || reducedMotion) return;

    const paths = Array.from(contour.querySelectorAll("path"));
    paths.forEach((path) => {
      path.setAttribute("pathLength", "1");
      path.setAttribute("stroke-dasharray", "0 1");
      path.setAttribute("stroke-dashoffset", "0");
    });

    const sharedDelay = Math.max(0, (startAt - performance.now()) / 1000);
    const baseDelay = sharedDelay + introDelays[layer.id];
    const pathStep = paths.length > 1 ? 1.2 / (paths.length - 1) : 0;
    const drawing = animate(paths, { pathLength: [0, 1] }, {
      duration: 3.8,
      delay: stagger(pathStep, { startDelay: baseDelay }),
      ease: [0.42, 0, 0.2, 1],
    });
    const pngBlend = animate(png, { opacity: [0, 0, 1] }, {
      duration: 5.4,
      delay: baseDelay,
      times: [0, 0.72, 1],
      ease: [0.32, 0, 0.18, 1],
    });
    const contourVisibility = animate(contour, { opacity: [0, 1, 1, 0] }, {
      duration: 5.45,
      delay: baseDelay,
      times: [0, 0.018, 0.84, 1],
      ease: "linear",
    });

    return () => {
      drawing.stop();
      pngBlend.stop();
      contourVisibility.stop();
    };
  }, [layer.id, reducedMotion, startAt]);

  return (
    <svg
      className="scene-art-layer"
      style={{ "--z": layer.drawOrder } as React.CSSProperties}
      viewBox={TOILE_SCENE.viewBox}
      preserveAspectRatio="xMidYMid meet"
      data-layer-id={layer.id}
      data-zoom={profile.zoom}
      data-shift-y={profile.y}
      data-shift-x={profile.x}
      data-pointer-depth={profile.pointer}
      data-rotate={profile.rotate}
      aria-hidden="true"
      focusable="false"
    >
      <image
        ref={pngRef}
        data-final-png=""
        href={layer.src}
        width="1672"
        height="941"
        preserveAspectRatio="none"
        style={{ opacity: reducedMotion ? 1 : 0 }}
      />
      <g
        ref={contourRef}
        className="scene-drawing-contours"
        style={{ opacity: reducedMotion ? 0 : 0 }}
        dangerouslySetInnerHTML={{ __html: contourMarkup }}
      />
    </svg>
  );
}

export function AnimatedParallaxScene() {
  const sceneRef = useRef<HTMLElement>(null);
  const [contours, setContours] = useState<Record<string, string>>({});
  const [startAt, setStartAt] = useState(0);
  const reducedMotion = useReducedMotion();
  const animatedLayers = TOILE_SCENE.layers.filter(
    (layer): layer is typeof layer & AnimatedLayer => "contourSrc" in layer,
  );
  const ready = animatedLayers.every((layer) => contours[layer.id]);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all(animatedLayers.map(async (layer) => {
      const response = await fetch(layer.contourSrc, { signal: controller.signal });
      if (!response.ok) throw new Error(`Could not load ${layer.contourSrc}`);
      const text = await response.text();
      const document = new DOMParser().parseFromString(text, "image/svg+xml");
      if (document.querySelector("parsererror")) throw new Error(`Invalid SVG: ${layer.contourSrc}`);
      return [layer.id, document.documentElement.innerHTML] as const;
    })).then((entries) => {
      setContours(Object.fromEntries(entries));
      setStartAt(performance.now() + 650);
    });
    return () => controller.abort();
  // The scene manifest is static for the lifetime of the page.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || reducedMotion) return;

    let frame = 0;
    const target = { progress: 0, pointerX: 0, pointerY: 0 };
    const current = { progress: 0, pointerX: 0, pointerY: 0 };

    const apply = () => {
      current.progress += (target.progress - current.progress) * 0.09;
      current.pointerX += (target.pointerX - current.pointerX) * 0.07;
      current.pointerY += (target.pointerY - current.pointerY) * 0.07;
      scene.style.setProperty("--scene-progress", current.progress.toFixed(4));
      scene.style.setProperty("--title-opacity", Math.max(0, 1 - current.progress * 3.4).toFixed(4));
      scene.style.setProperty("--title-shift", `${(-current.progress * 22).toFixed(2)}px`);
      const crossingIn = smoothstep((current.progress - 0.4) / 0.1);
      const crossingOut = 1 - smoothstep((current.progress - 0.68) / 0.1);
      scene.style.setProperty("--crossing-opacity", (crossingIn * crossingOut).toFixed(4));
      const closingOpacity = smoothstep((current.progress - 0.82) / 0.12);
      scene.style.setProperty("--closing-opacity", closingOpacity.toFixed(4));
      scene.style.setProperty("--closing-shift", `${((1 - closingOpacity) * 8).toFixed(2)}px`);

      const approach = smoothstep(current.progress / 0.38);
      const crossing = smoothstep((current.progress - 0.38) / 0.34);
      const farShore = smoothstep((current.progress - 0.72) / 0.28);

      scene.querySelectorAll<SVGSVGElement>("[data-layer-id]").forEach((element) => {
        const layerId = element.dataset.layerId ?? "";
        const zoom = Number(element.dataset.zoom ?? 0);
        const shiftY = Number(element.dataset.shiftY ?? 0);
        const shiftX = Number(element.dataset.shiftX ?? 0);
        const pointerDepth = Number(element.dataset.pointerDepth ?? 0);
        const rotation = Number(element.dataset.rotate ?? 0);
        const connectedToLake = ["water", "mountains", "background-village", "boat"].includes(layerId);
        const foreground = ["foreground-plants", "left-wall"].includes(layerId);
        const nearShore = ["left-land-underlay", "left-gap-bushes", "main-villa"].includes(layerId);
        const continuingZoom = connectedToLake
          ? crossing * 0.56 + farShore * 0.34
          : nearShore
            ? crossing * 0.76 + farShore * 0.3
            : crossing * 0.32;
        const lakePan = connectedToLake
          ? -innerWidth * (Math.sin(Math.PI * crossing) * 0.07 + crossing * 0.078)
          : 0;
        const x = approach * innerWidth * shiftX + lakePan + current.pointerX * pointerDepth;
        const y =
          approach * innerHeight * shiftY -
          crossing * innerHeight * (connectedToLake ? 0.018 : 0.006) +
          current.pointerY * pointerDepth * 0.55;
        const scale = 1 + approach * zoom + continuingZoom;
        const angle = approach * rotation + current.pointerX * rotation * 0.18;
        const originX = 44 + crossing * 48;
        const layerOpacity = foreground
          ? 1 - smoothstep(crossing / 0.58)
          : 1;
        const baseTranslateX = innerWidth <= 700 ? -64 : -50;
        element.style.opacity = layerOpacity.toFixed(4);
        element.style.transformOrigin = `${originX.toFixed(2)}% ${connectedToLake ? 100 : 72}%`;
        element.style.transform = `translate3d(calc(${baseTranslateX}% + ${x.toFixed(2)}px), calc(-50% + ${y.toFixed(2)}px), 0) scale(${scale.toFixed(5)}) rotate(${angle.toFixed(3)}deg)`;
      });

      const unsettled =
        Math.abs(target.progress - current.progress) > 0.0001 ||
        Math.abs(target.pointerX - current.pointerX) > 0.0005 ||
        Math.abs(target.pointerY - current.pointerY) > 0.0005;
      frame = unsettled ? requestAnimationFrame(apply) : 0;
    };

    const queue = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const updateScroll = () => {
      const maximum = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      target.progress = Math.min(1, Math.max(0, scrollY / maximum));
      queue();
    };
    const updatePointer = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      target.pointerX = event.clientX / innerWidth - 0.5;
      target.pointerY = event.clientY / innerHeight - 0.5;
      queue();
    };
    const resetPointer = () => {
      target.pointerX = 0;
      target.pointerY = 0;
      queue();
    };

    updateScroll();
    addEventListener("scroll", updateScroll, { passive: true });
    addEventListener("resize", updateScroll);
    addEventListener("pointermove", updatePointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", resetPointer);
    return () => {
      removeEventListener("scroll", updateScroll);
      removeEventListener("resize", updateScroll);
      removeEventListener("pointermove", updatePointer);
      document.documentElement.removeEventListener("pointerleave", resetPointer);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ready, reducedMotion]);

  return (
    <main className="parallax-page">
      <section
        className="drawing-scene"
        ref={sceneRef}
        aria-label="A Mediterranean toile landscape drawn in ink, then brought into depth while scrolling"
      >
        <img
          className="scene-art-layer scene-paper-layer"
          style={{ "--z": 0 } as React.CSSProperties}
          src="/art/parallax/00-paper-sky.png"
          alt=""
          aria-hidden="true"
          draggable={false}
        />
        {ready ? animatedLayers.map((layer) => (
          <AnimatedParallaxLayer
            key={layer.id}
            layer={layer}
            contourMarkup={contours[layer.id]}
            startAt={startAt}
          />
        )) : null}
        <header className="scene-title">
          <div className="scene-title-inner">
            <p className="scene-kicker">Lago · Italia</p>
            <h1>Villa Bellacqua</h1>
            <svg className="scene-title-rule" viewBox="0 0 240 18" aria-hidden="true">
              <path d="M3 11 C49 5 85 14 126 9 C167 4 195 11 237 6" pathLength="1" />
            </svg>
            <p className="scene-subtitle">A house drawn from memory</p>
          </div>
        </header>
        <p className="scene-closing">Where water, stone,<br />and memory meet.</p>
        <p className="scene-crossing">The lake keeps<br />its own time.</p>
        <div className="scene-scroll-cue" aria-hidden="true">
          <span />
        </div>
        <div className="scene-paper-grain" aria-hidden="true" />
        <div className="scene-vignette" aria-hidden="true" />
      </section>
    </main>
  );
}
