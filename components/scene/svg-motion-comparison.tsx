"use client";

import { animate, stagger } from "motion";
import { useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import styles from "./svg-motion-comparison.module.css";

const cropViewBox = "1560 560 110 220";

const vectorAttempts = [
  { label: "Current manual V3", src: "/art/parallax-svg/05-boat-v3.svg" },
  { label: "VTracer — detailed", src: "/art/parallax-svg/experiments/05-boat-vtracer-detailed.svg" },
  { label: "VTracer — toile palette", src: "/art/parallax-svg/experiments/05-boat-vtracer-toile.svg" },
  { label: "VTracer — balanced", src: "/art/parallax-svg/experiments/05-boat-vtracer-balanced.svg" },
  { label: "ImageTracerJS — detailed", src: "/art/parallax-svg/experiments/05-boat-imagetracer-detailed.svg" },
  { label: "Potrace — eight levels", src: "/art/parallax-svg/experiments/05-boat-potrace-8-level.svg" },
  { label: "Vecline — centerline", src: "/art/parallax-svg/experiments/05-boat-vecline-centerline.svg" },
  { label: "Skeleton Tracing — multipass", src: "/art/parallax-svg/experiments/05-boat-skeleton-tracing-multipass.svg" },
] as const;

function visiblePaint(value: string) {
  const normalized = value.replaceAll(" ", "").toLowerCase();

  return (
    normalized !== "" &&
    normalized !== "none" &&
    normalized !== "transparent" &&
    normalized !== "rgba(0,0,0,0)" &&
    !normalized.endsWith(",0)")
  );
}

function AnimatedSvg({
  markup,
  pathCount,
  run,
  startAt,
  seconds,
  finalOnly,
  revealFinal,
}: {
  markup: string;
  pathCount: number;
  run: number;
  startAt: number;
  seconds: number;
  finalOnly: boolean;
  revealFinal: boolean;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const svg = svgRef.current;

    if (!svg || !markup || finalOnly || reducedMotion) return;

    const namespace = "http://www.w3.org/2000/svg";
    const finalGroup = document.createElementNS(namespace, "g");
    finalGroup.dataset.motionFinal = "";

    for (const child of Array.from(svg.children)) {
      const tag = child.tagName.toLowerCase();
      if (!["defs", "style", "title", "desc"].includes(tag)) finalGroup.appendChild(child);
    }

    svg.appendChild(finalGroup);

    const drawingGroup = finalGroup.cloneNode(true) as SVGGElement;
    drawingGroup.removeAttribute("id");
    drawingGroup.removeAttribute("data-motion-final");
    drawingGroup.dataset.motionDrawing = "";
    drawingGroup.setAttribute("aria-hidden", "true");
    svg.appendChild(drawingGroup);

    finalGroup.style.opacity = "0";

    const drawablePaths: SVGPathElement[] = [];

    for (const path of Array.from(drawingGroup.querySelectorAll("path"))) {
      const computed = getComputedStyle(path);
      const fill = computed.fill;
      const stroke = computed.stroke;
      const hasFill = visiblePaint(fill) && Number.parseFloat(computed.fillOpacity) > 0;
      const hasStroke = visiblePaint(stroke) && Number.parseFloat(computed.strokeOpacity) > 0;
      const drawingColor = hasStroke ? stroke : hasFill ? fill : "";

      if (!drawingColor) {
        path.remove();
        continue;
      }

      path.style.fill = "none";
      path.style.stroke = drawingColor;
      path.style.strokeWidth = hasStroke && Number.parseFloat(computed.strokeWidth) > 0
        ? computed.strokeWidth
        : "0.55px";
      path.style.strokeLinecap = "round";
      path.style.strokeLinejoin = "round";
      path.style.strokeOpacity = "1";
      path.style.opacity = "1";

      let length = 0;
      try {
        length = path.getTotalLength();
      } catch {
        path.remove();
        continue;
      }

      if (!Number.isFinite(length) || length <= 0.01) {
        path.remove();
        continue;
      }

      path.setAttribute("pathLength", "1");
      path.setAttribute("stroke-dasharray", "0 1");
      path.setAttribute("stroke-dashoffset", "0");
      drawablePaths.push(path);
    }

    const staggerWindow = seconds * 0.22;
    const drawSeconds = seconds * 0.7;
    const revealSeconds = Math.max(0.25, seconds * 0.16);
    const sharedStartDelay = Math.max(0, (startAt - performance.now()) / 1000);
    const delayStep = drawablePaths.length > 1
      ? staggerWindow / (drawablePaths.length - 1)
      : 0;
    const revealAt = drawSeconds + staggerWindow;

    const drawing = animate(
      drawablePaths,
      { pathLength: [0, 1] },
      {
        duration: drawSeconds,
        delay: stagger(delayStep, { startDelay: sharedStartDelay }),
        ease: [0.45, 0, 0.2, 1],
      },
    );

    let reveal: ReturnType<typeof animate> | undefined;
    let fade: ReturnType<typeof animate> | undefined;
    let drawingCleanupTimer = 0;
    let revealTimer = 0;

    if (revealFinal) {
      revealTimer = window.setTimeout(() => {
        reveal = animate(finalGroup, { opacity: 1 }, { duration: revealSeconds, ease: "easeOut" });
        fade = animate(drawingGroup, { opacity: 0 }, { duration: revealSeconds, ease: "easeOut" });
        drawingCleanupTimer = window.setTimeout(() => drawingGroup.remove(), revealSeconds * 1000 + 50);
      }, (sharedStartDelay + revealAt) * 1000);
    }

    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(drawingCleanupTimer);
      drawing.stop();
      reveal?.stop();
      fade?.stop();
    };
  }, [finalOnly, markup, reducedMotion, revealFinal, run, seconds, startAt]);

  return (
    <>
      <svg
        key={`${run}-${finalOnly ? "final" : revealFinal ? "draw-and-finish" : "draw"}`}
        ref={svgRef}
        className={styles.svg}
        viewBox={cropViewBox}
        preserveAspectRatio="xMidYMid meet"
        dangerouslySetInnerHTML={{ __html: markup }}
        aria-hidden="true"
      />
      <span className={styles.pathCount}>{pathCount.toLocaleString()} paths</span>
    </>
  );
}

export function SvgMotionComparison() {
  const [assets, setAssets] = useState<Record<string, { markup: string; pathCount: number }>>({});
  const [loadError, setLoadError] = useState("");
  const [run, setRun] = useState({ id: 0, startAt: 0 });
  const [seconds, setSeconds] = useState(4);
  const [finalOnly, setFinalOnly] = useState(false);
  const [revealFinal, setRevealFinal] = useState(false);
  const ready = vectorAttempts.every((attempt) => assets[attempt.src]);

  useEffect(() => {
    const controller = new AbortController();

    Promise.all(
      vectorAttempts.map(async (attempt) => {
        const response = await fetch(attempt.src, { signal: controller.signal });
        if (!response.ok) throw new Error(`Could not load ${attempt.src}`);

        const text = await response.text();
        const document = new DOMParser().parseFromString(text, "image/svg+xml");
        const root = document.documentElement;

        if (root.tagName.toLowerCase() !== "svg" || document.querySelector("parsererror")) {
          throw new Error(`Invalid SVG: ${attempt.src}`);
        }

        return [
          attempt.src,
          { markup: root.innerHTML, pathCount: root.querySelectorAll("path").length },
        ] as const;
      }),
    )
      .then((entries) => {
        setAssets(Object.fromEntries(entries));
        setLoadError("");
        setRun({ id: 1, startAt: performance.now() + 900 });
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setLoadError(reason instanceof Error ? reason.message : "Could not load SVG comparison files");
      });

    return () => controller.abort();
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

  const toggleFinish = () => {
    if (!ready) return;
    setRevealFinal((current) => !current);
    setFinalOnly(false);
    setRun((current) => ({ id: current.id + 1, startAt: performance.now() + 900 }));
  };

  return (
    <main className={styles.page}>
      <header className={styles.controls}>
        <button type="button" onClick={replay} disabled={!ready}>Replay all</button>
        <button type="button" onClick={() => setFinalOnly(true)} disabled={!ready}>Show final art</button>
        <button
          type="button"
          onClick={toggleFinish}
          disabled={!ready}
          aria-pressed={revealFinal}
        >
          {revealFinal ? "Finish: final art" : "Finish: strokes only"}
        </button>
        <label>
          Duration
          <select value={seconds} onChange={(event) => changeDuration(Number(event.target.value))}>
            <option value={2}>2 seconds</option>
            <option value={4}>4 seconds</option>
            <option value={8}>8 seconds</option>
          </select>
        </label>
      </header>

      <section className={styles.grid} aria-label="Motion SVG comparison">
        <article className={styles.card}>
          <div className={styles.artwork}>
            <svg
              className={styles.svg}
              viewBox={cropViewBox}
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label="PNG reference boat"
            >
              <image
                href="/art/parallax/05-boat.png"
                width="1672"
                height="941"
                preserveAspectRatio="none"
              />
            </svg>
          </div>
          <h2>PNG reference</h2>
        </article>

        {vectorAttempts.map((attempt) => (
          <article className={styles.card} key={attempt.src}>
            <div className={styles.artwork}>
              {assets[attempt.src] ? (
                <AnimatedSvg
                  markup={assets[attempt.src].markup}
                  pathCount={assets[attempt.src].pathCount}
                  run={run.id}
                  startAt={run.startAt}
                  seconds={seconds}
                  finalOnly={finalOnly}
                  revealFinal={revealFinal}
                />
              ) : loadError ? (
                <p className={styles.error}>{loadError}</p>
              ) : (
                <div className={styles.loading} aria-label="Loading SVG" />
              )}
            </div>
            <h2>{attempt.label}</h2>
          </article>
        ))}
      </section>
    </main>
  );
}
