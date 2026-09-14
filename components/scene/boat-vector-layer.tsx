"use client";

import { motion, useReducedMotion } from "motion/react";
import type { CSSProperties } from "react";

import boat from "@/lib/boat-vector-v3.json";

const drawingEase = [0.45, 0, 0.2, 1] as const;

export function BoatVectorLayer({ style }: { style: CSSProperties }) {
  const reducedMotion = useReducedMotion();
  const instant = Boolean(reducedMotion);

  return (
    <svg
      className="png-layer boat-vector-layer"
      style={style}
      viewBox={boat.viewBox}
      preserveAspectRatio="xMidYMid meet"
      shapeRendering="geometricPrecision"
      aria-hidden="true"
      focusable="false"
    >
      <g id="boat-paper-masks" fill="#fbf7e9">
        {boat.paperMasks.map((mask) => (
          <path key={mask.id} id={`boat-${mask.id}`} data-part="paper-mask" d={mask.d} />
        ))}
      </g>

      {boat.strokeGroups.map((group) => (
        <g
          key={group.id}
          id={`boat-${group.id}`}
          fill="none"
          stroke={group.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {group.paths.map((path, index) => {
            const finalOpacity = path.opacity ?? 1;

            return (
              <motion.path
                key={path.id}
                id={`boat-${path.id}`}
                data-part={path.part}
                d={path.d}
                fill="none"
                stroke={path.stroke ?? group.stroke}
                strokeWidth={path.width}
                pathLength={1}
                initial={instant ? false : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: finalOpacity }}
                transition={{
                  duration: instant ? 0 : group.duration,
                  delay: instant ? 0 : group.start + index * group.stagger,
                  ease: drawingEase,
                }}
              />
            );
          })}
        </g>
      ))}
    </svg>
  );
}
