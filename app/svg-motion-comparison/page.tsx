import type { Metadata } from "next";

import { SvgMotionComparison } from "@/components/scene/svg-motion-comparison";

export const metadata: Metadata = {
  title: "Motion SVG Comparison",
  description: "Synchronized path-drawing comparison of sailboat SVG traces.",
};

export default function SvgMotionComparisonPage() {
  return <SvgMotionComparison />;
}
