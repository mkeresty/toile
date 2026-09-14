"use client";

import { animate, stagger } from "motion";
import { useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { TOILE_SCENE } from "@/lib/toile-scene";

import styles from "./svg-fill-comparison.module.css";

type Bounds = { left: number; top: number; width: number; height: number };
type IllustratedLayer = {
  id: string;
  src: string;
  contourSrc: string;
  bounds: Bounds;
  drawOrder: number;
};
type ContourAsset = { markup: string; pathCount: number };

const layerNames: Record<string, string> = {
  "paper-sky": "Paper and sky",
  water: "Water",
  "left-land-underlay": "Left shoreline and rocks",
  "left-gap-bushes": "Left gap bushes",
  mountains: "Distant mountains",
  "background-village": "Background village and plants",
  boat: "Boat",
  "main-villa": "Main villa and plants",
  "left-wall": "Left stone wall",
  "foreground-plants": "Foreground olive branches",
};

function paddedViewBox(bounds: Bounds) {
  const padding = Math.max(10, Math.min(54, Math.max(bounds.width, bounds.height) * 0.045));
  const left = Math.max(0, bounds.left - padding);
  const top = Math.max(0, bounds.top - padding);
  const right = Math.min(1672, bounds.left + bounds.width + padding);
  const bottom = Math.min(941, bounds.top + bounds.height + padding);
  return `${left} ${top} ${right - left} ${bottom - top}`;
}

function artworkHeight(bounds: Bounds) {
  const ratio = bounds.width / bounds.height;
  if (ratio > 3.2) return "wide";
  if (ratio < 0.65) return "portrait";
  return "landscape";
}

function sharedDelay(startAt: number) {
  return Math.max(0, (startAt - performance.now()) / 1000);
}

function PngReference({ layer }: { layer: IllustratedLayer }) {
  return (
    <svg
      className={styles.svg}
      viewBox={paddedViewBox(layer.bounds)}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`${layerNames[layer.id]} PNG reference`}
    >
      <image href={layer.src} width="1672" height="941" preserveAspectRatio="none" />
    </svg>
  );
}

function StrokeBlendAnimation({
  layer,
  contour,
  run,
  startAt,
  seconds,
  finalOnly,
}: {
  layer: IllustratedLayer;
  contour: ContourAsset;
  run: number;
  startAt: number;
  seconds: number;
  finalOnly: boolean;
}) {
  const contourRef = useRef<SVGGElement>(null);
  const pngRef = useRef<SVGImageElement>(null);
  const reducedMotion = useReducedMotion();
  const showFinal = finalOnly || reducedMotion;

  useLayoutEffect(() => {
    const contourGroup = contourRef.current;
    const png = pngRef.current;
    if (!contourGroup || !png || showFinal) return;

    const paths = Array.from(contourGroup.querySelectorAll("path"));
    paths.forEach((path) => {
      path.setAttribute("pathLength", "1");
      path.setAttribute("stroke-dasharray", "0 1");
      path.setAttribute("stroke-dashoffset", "0");
    });

    const delay = sharedDelay(startAt);
    const pathStep = paths.length > 1 ? seconds * 0.26 / (paths.length - 1) : 0;
    const drawing = animate(paths, { pathLength: [0, 1] }, {
      duration: seconds * 0.62,
      delay: stagger(pathStep, { startDelay: delay }),
      ease: [0.42, 0, 0.2, 1],
    });
    const pngBlend = animate(png, { opacity: [0, 0, 1] }, {
      duration: seconds,
      delay,
      times: [0, 0.7, 1],
      ease: [0.32, 0, 0.18, 1],
    });
    const contourBlend = animate(contourGroup, { opacity: [1, 1, 0] }, {
      duration: seconds,
      delay,
      times: [0, 0.78, 1],
      ease: "linear",
    });

    return () => {
      drawing.stop();
      pngBlend.stop();
      contourBlend.stop();
    };
  }, [run, seconds, showFinal, startAt]);

  return (
    <>
      <svg
        key={`${layer.id}-${run}-${showFinal ? "final" : "draw"}`}
        className={styles.svg}
        viewBox={paddedViewBox(layer.bounds)}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`${layerNames[layer.id]} lightweight SVG stroke to PNG blend`}
      >
        <image
          ref={pngRef}
          data-blend-png=""
          href={layer.src}
          width="1672"
          height="941"
          preserveAspectRatio="none"
          style={{ opacity: showFinal ? 1 : 0 }}
        />
        <g
          ref={contourRef}
          className={styles.contour}
          style={{ opacity: showFinal ? 0 : 1 }}
          dangerouslySetInnerHTML={{ __html: contour.markup }}
        />
      </svg>
      <span className={styles.methodTag}>
        {contour.pathCount.toLocaleString()} lightweight paths · PNG blends in at 70%
      </span>
    </>
  );
}

function ViewportStrokeBlend(props: Parameters<typeof StrokeBlendAnimation>[0]) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const element = mountRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: "420px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={mountRef} className={styles.animationMount}>
      {active ? <StrokeBlendAnimation {...props} /> : null}
    </div>
  );
}

function StaticFoundation() {
  return (
    <section className={styles.componentSection}>
      <div className={styles.componentHeading}>
        <span>00</span>
        <h2>Paper and sky</h2>
        <p>Static foundation — no linework to animate</p>
      </div>
      <div className={styles.foundationArtwork}>
        {/* eslint-disable-next-line @next/next/no-img-element -- exact source-layer comparison */}
        <img src="/art/parallax/00-paper-sky.png" alt="Paper and sky PNG layer" />
      </div>
    </section>
  );
}

function ComponentComparison({
  layer,
  contour,
  index,
  run,
  startAt,
  seconds,
  finalOnly,
}: {
  layer: IllustratedLayer;
  contour: ContourAsset;
  index: number;
  run: number;
  startAt: number;
  seconds: number;
  finalOnly: boolean;
}) {
  const heightClass = styles[artworkHeight(layer.bounds)];

  return (
    <section className={styles.componentSection} id={layer.id}>
      <div className={styles.componentHeading}>
        <span>{String(index).padStart(2, "0")}</span>
        <h2>{layerNames[layer.id]}</h2>
        <p>{layer.bounds.width} × {layer.bounds.height}px visible bounds</p>
      </div>
      <div className={styles.comparisonRow}>
        <article className={styles.card}>
          <div className={`${styles.artwork} ${heightClass}`}>
            <PngReference layer={layer} />
          </div>
          <h3>PNG reference</h3>
        </article>
        <article className={styles.card}>
          <div className={`${styles.artwork} ${heightClass}`}>
            <ViewportStrokeBlend
              layer={layer}
              contour={contour}
              run={run}
              startAt={startAt}
              seconds={seconds}
              finalOnly={finalOnly}
            />
          </div>
          <h3>Lightweight SVG strokes → exact PNG</h3>
        </article>
      </div>
    </section>
  );
}

export function SvgStrokeBlendComparison() {
  const illustratedLayers = TOILE_SCENE.layers.filter(
    (layer): layer is typeof layer & IllustratedLayer => "contourSrc" in layer,
  );
  const [contours, setContours] = useState<Record<string, ContourAsset>>({});
  const [loadError, setLoadError] = useState("");
  const [run, setRun] = useState({ id: 0, startAt: 0 });
  const [seconds, setSeconds] = useState(6);
  const [finalOnly, setFinalOnly] = useState(false);
  const ready = illustratedLayers.every((layer) => contours[layer.id]);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all(illustratedLayers.map(async (layer) => {
      const response = await fetch(layer.contourSrc, { signal: controller.signal });
      if (!response.ok) throw new Error(`Could not load ${layer.contourSrc}`);
      const text = await response.text();
      const document = new DOMParser().parseFromString(text, "image/svg+xml");
      const root = document.documentElement;
      if (root.tagName.toLowerCase() !== "svg" || document.querySelector("parsererror")) {
        throw new Error(`Invalid SVG: ${layer.contourSrc}`);
      }
      return [layer.id, {
        markup: root.innerHTML,
        pathCount: root.querySelectorAll("path").length,
      }] as const;
    }))
      .then((entries) => {
        setContours(Object.fromEntries(entries));
        setLoadError("");
        setRun({ id: 1, startAt: performance.now() + 900 });
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setLoadError(reason instanceof Error ? reason.message : "Could not load SVG contours");
      });

    return () => controller.abort();
  // The scene manifest is static for the lifetime of the page.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const replay = () => {
    if (!ready) return;
    setFinalOnly(false);
    setRun((current) => ({ id: current.id + 1, startAt: performance.now() + 900 }));
  };

  const changeDuration = (nextSeconds: number) => {
    setSeconds(nextSeconds);
    if (!ready) return;
    setFinalOnly(false);
    setRun((current) => ({ id: current.id + 1, startAt: performance.now() + 900 }));
  };

  return (
    <main className={styles.page}>
      <header className={styles.controls}>
        <div className={styles.title}>Approach 3 · lightweight strokes to exact PNG</div>
        <div className={styles.actions}>
          <button type="button" onClick={replay} disabled={!ready}>Replay all</button>
          <button type="button" onClick={() => setFinalOnly(true)} disabled={!ready}>Show final PNG</button>
          <label>
            Duration
            <select value={seconds} onChange={(event) => changeDuration(Number(event.target.value))}>
              <option value={4}>4 seconds</option>
              <option value={6}>6 seconds</option>
              <option value={10}>10 seconds</option>
            </select>
          </label>
        </div>
      </header>

      {loadError ? <p className={styles.error}>{loadError}</p> : null}

      <div className={styles.components} aria-label="Lightweight SVG path drawing followed by PNG blending">
        <StaticFoundation />
        {ready ? illustratedLayers.map((layer, index) => (
          <ComponentComparison
            key={`${layer.id}-${run.id}-${finalOnly ? "final" : "animated"}`}
            layer={layer}
            contour={contours[layer.id]}
            index={index + 1}
            run={run.id}
            startAt={run.startAt}
            seconds={seconds}
            finalOnly={finalOnly}
          />
        )) : (
          <div className={styles.loadingArea}><div className={styles.loading} /></div>
        )}
      </div>
    </main>
  );
}
