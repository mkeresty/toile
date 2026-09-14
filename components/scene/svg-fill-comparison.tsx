"use client";

import { animate, stagger } from "motion";
import { useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

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
type FinalVectorManifestEntry = { id: string; paths: number };
type RevealProfile = { angle: number; label: string; stagger: "forward" | "center" };

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

const revealProfiles: Record<string, RevealProfile> = {
  water: { angle: 0, label: "horizontal ink sweep", stagger: "forward" },
  "left-land-underlay": { angle: -14, label: "rising diagonal ink sweep", stagger: "forward" },
  "left-gap-bushes": { angle: -72, label: "branch-height ink sweep", stagger: "center" },
  mountains: { angle: -28, label: "mountain-slope ink sweep", stagger: "forward" },
  "background-village": { angle: -90, label: "ground-up vertical ink sweep", stagger: "center" },
  boat: { angle: -90, label: "keel-to-mast vertical ink sweep", stagger: "center" },
  "main-villa": { angle: -90, label: "ground-up vertical ink sweep", stagger: "center" },
  "left-wall": { angle: 0, label: "masonry-line ink sweep", stagger: "forward" },
  "foreground-plants": { angle: -22, label: "branch-direction ink sweep", stagger: "center" },
};

function noise(index: number) {
  const value = Math.sin(index * 91.733 + 17.127) * 43758.5453;
  return (value - Math.floor(value)) * 2 - 1;
}

function hash(value: string) {
  let result = 0;
  for (const character of value) result = (result * 31 + character.charCodeAt(0)) | 0;
  return Math.abs(result);
}

function makeDirectionalBrushStrokes(bounds: Bounds, profile: RevealProfile, seed: number) {
  const spacing = Math.max(4.5, Math.min(10, Math.min(bounds.width, bounds.height) / 55));
  const baseAngle = profile.angle * Math.PI / 180;
  const centerX = bounds.left + bounds.width / 2;
  const centerY = bounds.top + bounds.height / 2;
  const diagonal = Math.hypot(bounds.width, bounds.height) * 1.4;
  const baseNormalX = -Math.sin(baseAngle);
  const baseNormalY = Math.cos(baseAngle);
  const crossSpan = Math.abs(baseNormalX) * bounds.width + Math.abs(baseNormalY) * bounds.height;
  const lineCount = Math.ceil(crossSpan / spacing) + 4;
  const strokes: Array<{ d: string; order: number }> = [];

  for (let index = 0; index < lineCount; index += 1) {
    const sample = seed + index * 83;
    const offset = (index - (lineCount - 1) / 2) * spacing;
    const angle = baseAngle + noise(sample + 100) * 0.035;
    const directionX = Math.cos(angle);
    const directionY = Math.sin(angle);
    const normalX = -Math.sin(angle);
    const normalY = Math.cos(angle);
    const lineCenterX = centerX + baseNormalX * offset + noise(sample + 200) * spacing * 0.12;
    const lineCenterY = centerY + baseNormalY * offset + noise(sample + 300) * spacing * 0.12;
    const halfLength = diagonal * (0.52 + (noise(sample + 400) + 1) * 0.025);
    const startX = lineCenterX - directionX * halfLength;
    const startY = lineCenterY - directionY * halfLength;
    const endX = lineCenterX + directionX * halfLength;
    const endY = lineCenterY + directionY * halfLength;
    const bend = noise(sample + 500) * spacing * 0.7;
    const d = [
      `M${startX.toFixed(2)} ${startY.toFixed(2)}`,
      `Q${(lineCenterX + normalX * bend).toFixed(2)} ${(lineCenterY + normalY * bend).toFixed(2)}`,
      `${endX.toFixed(2)} ${endY.toFixed(2)}`,
    ].join(" ");
    const normalized = lineCount > 1 ? index / (lineCount - 1) : 0;
    const order = profile.stagger === "center" ? Math.abs(normalized - 0.5) : normalized;
    strokes.push({ d, order });
  }

  return {
    strokeWidth: spacing * 1.5,
    paths: strokes.sort((a, b) => a.order - b.order).map((stroke) => stroke.d),
  };
}

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

function AnimatedFill({
  layer,
  contour,
  finalPathCount,
  run,
  startAt,
  seconds,
  finalOnly,
}: {
  layer: IllustratedLayer;
  contour: ContourAsset;
  finalPathCount: number;
  run: number;
  startAt: number;
  seconds: number;
  finalOnly: boolean;
}) {
  const contourRef = useRef<SVGGElement>(null);
  const maskRef = useRef<SVGGElement>(null);
  const reducedMotion = useReducedMotion();
  const showFinal = finalOnly || reducedMotion;
  const revealProfile = revealProfiles[layer.id];
  const brush = useMemo(
    () => makeDirectionalBrushStrokes(layer.bounds, revealProfile, hash(layer.id)),
    [layer.bounds, layer.id, revealProfile],
  );
  const maskId = `fill-comparison-mask-${layer.id}-${run}`;
  const finalSvgSrc = `/art/parallax-svg/final/${layer.id}.svg`;

  useLayoutEffect(() => {
    const contourGroup = contourRef.current;
    const maskGroup = maskRef.current;
    if (!contourGroup || !maskGroup || showFinal) return;

    const contourPaths = Array.from(contourGroup.querySelectorAll("path"));
    const brushPaths = Array.from(maskGroup.querySelectorAll("path"));
    contourPaths.forEach((path) => {
      path.setAttribute("pathLength", "1");
      path.setAttribute("stroke-dasharray", "0 1");
      path.setAttribute("stroke-dashoffset", "0");
    });

    const delay = sharedDelay(startAt);
    const contourWindow = seconds * 0.18;
    const contourStep = contourPaths.length > 1 ? contourWindow / (contourPaths.length - 1) : 0;
    const brushStep = brushPaths.length > 1 ? seconds * 0.53 / (brushPaths.length - 1) : 0;
    const drawing = animate(contourPaths, { pathLength: [0, 1] }, {
      duration: seconds * 0.46,
      delay: stagger(contourStep, { startDelay: delay }),
      ease: [0.42, 0, 0.2, 1],
    });
    const coloring = animate(brushPaths, { pathLength: [0, 1] }, {
      duration: seconds * 0.18,
      delay: stagger(brushStep, { startDelay: delay + seconds * 0.25 }),
      ease: [0.38, 0, 0.2, 1],
    });
    const contourVisibility = animate(contourGroup, { opacity: [0, 1, 1, 0] }, {
      duration: seconds,
      delay,
      times: [0, 0.015, 0.86, 1],
      ease: "linear",
    });

    return () => {
      drawing.stop();
      coloring.stop();
      contourVisibility.stop();
    };
  }, [brush.paths.length, run, seconds, showFinal, startAt]);

  return (
    <>
      <svg
        key={`${layer.id}-${run}-${showFinal ? "final" : "draw"}`}
        className={styles.svg}
        viewBox={paddedViewBox(layer.bounds)}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`${layerNames[layer.id]} animated detailed SVG`}
      >
        <defs>
          <mask
            id={maskId}
            maskUnits="userSpaceOnUse"
            maskContentUnits="userSpaceOnUse"
            x={layer.bounds.left}
            y={layer.bounds.top}
            width={layer.bounds.width}
            height={layer.bounds.height}
          >
            <rect
              x={layer.bounds.left}
              y={layer.bounds.top}
              width={layer.bounds.width}
              height={layer.bounds.height}
              fill="black"
            />
            <g ref={maskRef}>
              {brush.paths.map((d, index) => (
                <path
                  key={index}
                  data-directional-stroke=""
                  d={d}
                  fill="none"
                  stroke="white"
                  strokeWidth={brush.strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength="1"
                  strokeDasharray={showFinal ? "1 1" : "0 1"}
                />
              ))}
            </g>
          </mask>
        </defs>
        <image
          data-final-svg=""
          href={finalSvgSrc}
          width="1672"
          height="941"
          preserveAspectRatio="none"
          mask={showFinal ? undefined : `url(#${maskId})`}
        />
        <g
          ref={contourRef}
          className={styles.contour}
          style={{ opacity: showFinal ? 0 : undefined }}
          dangerouslySetInnerHTML={{ __html: contour.markup }}
        />
      </svg>
      <span className={styles.methodTag}>
        {revealProfile.label} · {finalPathCount.toLocaleString()} final SVG paths
      </span>
    </>
  );
}

function ViewportAnimatedFill(props: Parameters<typeof AnimatedFill>[0]) {
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
      {active ? <AnimatedFill {...props} /> : null}
    </div>
  );
}

function StaticFoundation() {
  return (
    <section className={styles.componentSection}>
      <div className={styles.componentHeading}>
        <span>00</span>
        <h2>Paper and sky</h2>
        <p>Static foundation — no drawable marks</p>
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
  finalPathCount,
  index,
  run,
  startAt,
  seconds,
  finalOnly,
}: {
  layer: IllustratedLayer;
  contour: ContourAsset;
  finalPathCount: number;
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
            <ViewportAnimatedFill
              layer={layer}
              contour={contour}
              finalPathCount={finalPathCount}
              run={run}
              startAt={startAt}
              seconds={seconds}
              finalOnly={finalOnly}
            />
          </div>
          <h3>Noisy contour + directional SVG ink sweep</h3>
        </article>
      </div>
    </section>
  );
}

export function SvgFillComparison() {
  const illustratedLayers = TOILE_SCENE.layers.filter(
    (layer): layer is typeof layer & IllustratedLayer => "contourSrc" in layer,
  );
  const [contours, setContours] = useState<Record<string, ContourAsset>>({});
  const [finalPathCounts, setFinalPathCounts] = useState<Record<string, number>>({});
  const [loadError, setLoadError] = useState("");
  const [run, setRun] = useState({ id: 0, startAt: 0 });
  const [seconds, setSeconds] = useState(6);
  const [finalOnly, setFinalOnly] = useState(false);
  const ready = illustratedLayers.every(
    (layer) => contours[layer.id] && finalPathCounts[layer.id],
  );

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
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
      })),
      fetch("/art/parallax-svg/final/manifest.json", { signal: controller.signal })
        .then(async (response) => {
          if (!response.ok) throw new Error("Could not load detailed SVG manifest");
          return response.json() as Promise<FinalVectorManifestEntry[]>;
        }),
    ])
      .then(([contourEntries, finalManifest]) => {
        setContours(Object.fromEntries(contourEntries));
        setFinalPathCounts(Object.fromEntries(finalManifest.map((entry) => [entry.id, entry.paths])));
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
        <div className={styles.title}>All component detailed SVG comparisons</div>
        <div className={styles.actions}>
          <button type="button" onClick={replay} disabled={!ready}>Replay all</button>
          <button type="button" onClick={() => setFinalOnly(true)} disabled={!ready}>Show final SVG</button>
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

      <div className={styles.components} aria-label="Detailed SVG animation comparison for every scene component">
        <StaticFoundation />
        {ready ? illustratedLayers.map((layer, index) => (
          <ComponentComparison
            key={`${layer.id}-${run.id}-${finalOnly ? "final" : "animated"}`}
            layer={layer}
            contour={contours[layer.id]}
            finalPathCount={finalPathCounts[layer.id]}
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
