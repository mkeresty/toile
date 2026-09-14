"use client";
import { animate } from "motion";
import { useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

type ChapterMotion = "advance" | "glide" | "depart";
type Chapter = {
  id: string;
  number: string;
  label: string;
  title: string;
  body: string;
  coda: string;
  image: string;
  contour: string;
  motion: ChapterMotion;
};

const chapters: Chapter[] = [
  {
    id: "garden",
    number: "II",
    label: "The Garden",
    title: "The house reveals itself slowly.",
    body: "Past the gate, the lake disappears. There is only warm stone, rosemary, and the patient shade of olives.",
    coda: "Every arrival begins beneath the trees.",
    image: "/art/story/02-garden.png",
    contour: "/art/story-svg/contours/garden.svg",
    motion: "advance",
  },
  {
    id: "table",
    number: "III",
    label: "The Table",
    title: "Nothing here is hurried.",
    body: "A chair waits in the shade. Lemons, linen, and lake light turn an ordinary afternoon into a ritual.",
    coda: "The best hours are never counted.",
    image: "/art/story/03-table.png",
    contour: "/art/story-svg/contours/table.svg",
    motion: "glide",
  },
  {
    id: "water",
    number: "IV",
    label: "The Water",
    title: "The lake carries the day home.",
    body: "From the water, the house becomes a handful of blue lines. Distance does not erase it. Distance completes it.",
    coda: "Some places are left only so they may be remembered.",
    image: "/art/story/04-water.png",
    contour: "/art/story-svg/contours/water.svg",
    motion: "depart",
  },
];

function smoothstep(value: number) {
  const clamped = Math.min(1, Math.max(0, value));
  return clamped * clamped * (3 - 2 * clamped);
}

function ChapterScene({ chapter, index }: { chapter: Chapter; index: number }) {
  const sectionRef = useRef<HTMLElement>(null);
  const artRef = useRef<SVGSVGElement>(null);
  const contourRef = useRef<SVGGElement>(null);
  const pngRef = useRef<SVGImageElement>(null);
  const [nearby, setNearby] = useState(false);
  const [active, setActive] = useState(false);
  const [contourMarkup, setContourMarkup] = useState("");
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const preloadObserver = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      if (entry.isIntersecting) setNearby(true);
    }, { rootMargin: "110% 0px 110% 0px", threshold: 0.01 });
    const activeObserver = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry?.isIntersecting) setActive(true);
    }, { threshold: 0.04 });
    preloadObserver.observe(section);
    activeObserver.observe(section);
    return () => {
      preloadObserver.disconnect();
      activeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!nearby || contourMarkup) return;
    const controller = new AbortController();
    fetch(chapter.contour, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Could not load ${chapter.contour}`);
        return response.text();
      })
      .then((text) => {
        const document = new DOMParser().parseFromString(text, "image/svg+xml");
        if (document.querySelector("parsererror")) throw new Error(`Invalid SVG: ${chapter.contour}`);
        setContourMarkup(document.documentElement.innerHTML);
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error(error);
        }
      });
    return () => controller.abort();
  }, [chapter.contour, contourMarkup, nearby]);

  useLayoutEffect(() => {
    const contour = contourRef.current;
    const png = pngRef.current;
    if (!active || !contourMarkup || !contour || !png) return;

    if (reducedMotion) {
      png.style.opacity = "1";
      contour.style.opacity = "0";
      return;
    }

    const paths = Array.from(contour.querySelectorAll("path"));
    paths.forEach((path) => {
      path.setAttribute("pathLength", "1");
      path.style.strokeDasharray = "0 1";
      path.style.strokeDashoffset = "0";
    });

    const pathStep = paths.length > 1 ? 1.8 / (paths.length - 1) : 0;
    paths.forEach((path, pathIndex) => {
      path.style.animationDelay = `${0.08 + pathIndex * pathStep}s`;
      path.classList.add("story-path-drawing");
    });
    const ink = animate(contour, { opacity: [0, 1, 1, 0] }, {
      duration: 6.15,
      times: [0, 0.025, 0.84, 1],
      ease: "linear",
    });
    const finalArt = animate(png, { opacity: [0, 0, 1] }, {
      duration: 6.05,
      times: [0, 0.68, 1],
      ease: [0.32, 0, 0.18, 1],
    });

    return () => {
      paths.forEach((path) => path.classList.remove("story-path-drawing"));
      ink.stop();
      finalArt.stop();
    };
  }, [active, contourMarkup, reducedMotion]);

  useEffect(() => {
    const section = sectionRef.current;
    const art = artRef.current;
    if (!section || !art || reducedMotion) return;

    let frame = 0;
    let current = 0;
    let target = 0;

    const render = () => {
      current += (target - current) * 0.085;
      const entrance = smoothstep(current / 0.055);
      const exit = 1 - smoothstep((current - 0.93) / 0.07);
      const intro = 1 - smoothstep((current - 0.16) / 0.16);
      const body = smoothstep((current - 0.2) / 0.12) * (1 - smoothstep((current - 0.54) / 0.14));
      const coda = smoothstep((current - 0.6) / 0.16);
      let scale = 1;
      let x = 0;
      let y = 0;
      let origin = "50% 50%";

      if (chapter.motion === "advance") {
        scale = 1.015 + current * 0.22;
        x = -innerWidth * current * 0.018;
        y = -innerHeight * current * 0.038;
        origin = "65% 74%";
      } else if (chapter.motion === "glide") {
        scale = 1.045 + current * 0.095;
        x = -innerWidth * current * 0.085;
        y = -innerHeight * current * 0.008;
        origin = "48% 68%";
      } else {
        scale = 1.035 + current * 0.13;
        x = -innerWidth * current * 0.038;
        y = -innerHeight * current * 0.025;
        origin = "71% 78%";
      }

      art.style.transformOrigin = origin;
      art.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(5)})`;
      section.style.setProperty("--chapter-visible", (entrance * exit).toFixed(4));
      section.style.setProperty("--chapter-intro", intro.toFixed(4));
      section.style.setProperty("--chapter-body", body.toFixed(4));
      section.style.setProperty("--chapter-coda", coda.toFixed(4));
      section.style.setProperty("--chapter-progress", current.toFixed(4));

      const unsettled = Math.abs(target - current) > 0.0001;
      frame = unsettled ? requestAnimationFrame(render) : 0;
    };

    const update = () => {
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, section.offsetHeight - innerHeight);
      target = Math.min(1, Math.max(0, -rect.top / distance));
      if (!frame) frame = requestAnimationFrame(render);
    };

    update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    return () => {
      removeEventListener("scroll", update);
      removeEventListener("resize", update);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [chapter.motion, reducedMotion]);

  return (
    <section
      className={`story-chapter story-chapter-${chapter.motion}`}
      id={chapter.id}
      ref={sectionRef}
      aria-label={`${chapter.number}. ${chapter.label}`}
    >
      <div className="story-frame">
        <div className="story-art-wrap">
          <svg
            ref={artRef}
            className="story-art"
            viewBox="0 0 1672 941"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
            focusable="false"
          >
            <image
              ref={pngRef}
              href={chapter.image}
              width="1672"
              height="941"
              preserveAspectRatio="none"
              style={{ opacity: reducedMotion ? 1 : 0 }}
            />
            {contourMarkup ? (
              <g
                ref={contourRef}
                className="story-contours"
                style={{ opacity: reducedMotion ? 0 : 0 }}
                dangerouslySetInnerHTML={{ __html: contourMarkup }}
              />
            ) : null}
          </svg>
        </div>

        <header className="story-copy story-copy-intro">
          <p className="story-index"><span>{chapter.number}</span> · {chapter.label}</p>
          <h2>{chapter.title}</h2>
        </header>

        <p className="story-copy story-copy-body">{chapter.body}</p>
        <p className="story-copy story-copy-coda">{chapter.coda}</p>

        {index === chapters.length - 1 ? (
          <footer className="story-epilogue">
            <span className="story-epilogue-mark">VB</span>
            <p>Villa Bellacqua</p>
            <a href="#garden">Return to the garden</a>
          </footer>
        ) : null}

        <div className="story-folio" aria-hidden="true">
          <span>{String(index + 2).padStart(2, "0")}</span>
          <i />
          <span>04</span>
        </div>
        <div className="story-paper-grain" aria-hidden="true" />
        <div className="story-edge" aria-hidden="true" />
      </div>
    </section>
  );
}

export function StoryChapters() {
  return (
    <div className="story-sequence" aria-label="The story of Villa Bellacqua">
      {chapters.map((chapter, index) => (
        <ChapterScene key={chapter.id} chapter={chapter} index={index} />
      ))}
    </div>
  );
}
