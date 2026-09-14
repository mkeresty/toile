"use client";

import { useEffect, useRef } from "react";

const SOURCE = "/toile.svg";

export function LayeredToileScene() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = root.current;
    if (!node || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const progress = Math.max(-1, Math.min(1, (innerHeight * 0.5 - rect.top) / innerHeight));
      node.style.setProperty("--scene-scroll", progress.toFixed(3));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="toile-plate" ref={root} aria-label="An engraved Mediterranean lakeside village being drawn into existence">
      <svg className="toile-layers" viewBox="0 0 1672 941" role="img" aria-hidden="true">
        <defs>
          <clipPath id="toile-far"><path d="M0 0H1672V560L1510 530L1360 548L1200 505L1050 535L900 490L750 520L600 460L430 505L260 455L0 500Z"/></clipPath>
          <clipPath id="toile-left"><path d="M0 310L225 330L390 300L560 350L750 420L930 500V941H0Z"/></clipPath>
          <clipPath id="toile-right"><path d="M875 315L1090 330L1280 230L1490 180L1672 220V941H880Z"/></clipPath>
          <clipPath id="toile-water"><path d="M0 650C330 700 520 665 735 690C980 720 1200 635 1672 640V941H0Z"/></clipPath>
          <clipPath id="toile-near"><path d="M0 490C100 520 170 570 260 650L390 941H0ZM1180 815C1350 730 1510 700 1672 685V941H1240Z"/></clipPath>
          <mask id="reveal-far"><rect className="reveal sweep-far" width="1672" height="941" fill="white"/></mask>
          <mask id="reveal-left"><rect className="reveal sweep-left" width="1672" height="941" fill="white"/></mask>
          <mask id="reveal-right"><rect className="reveal sweep-right" width="1672" height="941" fill="white"/></mask>
          <mask id="reveal-water"><rect className="reveal sweep-water" width="1672" height="941" fill="white"/></mask>
          <mask id="reveal-near"><rect className="reveal sweep-near" width="1672" height="941" fill="white"/></mask>
        </defs>

        <g className="depth depth-far" clipPath="url(#toile-far)" mask="url(#reveal-far)"><image href={SOURCE} width="1672" height="941"/></g>
        <g className="depth depth-left" clipPath="url(#toile-left)" mask="url(#reveal-left)"><image href={SOURCE} width="1672" height="941"/></g>
        <g className="depth depth-right" clipPath="url(#toile-right)" mask="url(#reveal-right)"><image href={SOURCE} width="1672" height="941"/></g>
        <g className="depth depth-water" clipPath="url(#toile-water)" mask="url(#reveal-water)"><image href={SOURCE} width="1672" height="941"/></g>
        <g className="depth depth-near" clipPath="url(#toile-near)" mask="url(#reveal-near)"><image href={SOURCE} width="1672" height="941"/></g>

        <g className="construction-lines" fill="none" pathLength={1}>
          <path d="M38 509C170 435 285 425 400 454S638 519 754 508S934 445 1060 470S1290 513 1403 434S1550 368 1640 398"/>
          <path d="M8 650C210 626 350 680 548 650S825 619 1010 664S1390 626 1660 645"/>
          <path d="M310 586V389L497 341L707 430V668M372 586V446H548V591M548 591V420M302 666H817"/>
          <path d="M910 612C1005 550 1068 508 1148 465S1326 298 1480 315S1600 367 1662 423"/>
          <path d="M73 755C188 700 252 721 343 790M1290 842C1406 764 1520 742 1650 716"/>
          <path d="M220 882C532 850 720 901 1000 858S1390 854 1650 830"/>
        </g>
      </svg>
      <div className="scene-grain" aria-hidden="true" />
    </div>
  );
}
