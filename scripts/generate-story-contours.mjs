import { mkdir, writeFile } from "node:fs/promises";

import sharp from "sharp";
import TraceSkeleton from "skeleton-tracing-js";

const width = 1672;
const height = 941;
const outputDirectory = "public/art/story-svg/contours";
const chapters = [
  { id: "garden", file: "02-garden.png", direction: "vertical" },
  { id: "table", file: "03-table.png", direction: "horizontal" },
  { id: "water", file: "04-water.png", direction: "radial" },
];
const passes = [
  { threshold: 224, strokeWidth: 0.72, opacity: 0.34, limit: 680 },
  { threshold: 176, strokeWidth: 0.88, opacity: 0.52, limit: 760 },
  { threshold: 126, strokeWidth: 1.02, opacity: 0.68, limit: 620 },
];

function choosePolylines(polylines, limit) {
  const eligible = polylines.filter((polyline) => polyline.length >= 4);
  if (eligible.length <= limit) return eligible;

  const longCount = Math.floor(limit * 0.56);
  const longest = [...eligible]
    .sort((a, b) => b.length - a.length)
    .slice(0, longCount);
  const selected = new Set(longest);
  const remainder = eligible.filter((polyline) => !selected.has(polyline));
  const sampleCount = limit - longest.length;
  const sampled = Array.from({ length: sampleCount }, (_, index) =>
    remainder[Math.floor((index + 0.35) * remainder.length / sampleCount)],
  ).filter(Boolean);

  return [...longest, ...sampled];
}

function centroid(polyline) {
  const totals = polyline.reduce(
    (sum, [x, y]) => [sum[0] + x, sum[1] + y],
    [0, 0],
  );
  return [totals[0] / polyline.length, totals[1] / polyline.length];
}

function ordered(polylines, direction) {
  return [...polylines].sort((a, b) => {
    const [ax, ay] = centroid(a);
    const [bx, by] = centroid(b);
    if (direction === "vertical") return by - ay || ax - bx;
    if (direction === "horizontal") return ax - bx || ay - by;
    const ar = Math.hypot(ax - width * 0.7, ay - height * 0.78);
    const br = Math.hypot(bx - width * 0.7, by - height * 0.78);
    return ar - br;
  });
}

await mkdir(outputDirectory, { recursive: true });
const manifest = [];

for (const chapter of chapters) {
  const source = `public/art/story/${chapter.file}`;
  const pixels = await sharp(source)
    .resize(width, height, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer();
  const groups = [];
  let pathCount = 0;

  for (const pass of passes) {
    const mask = [];
    for (let index = 0; index < pixels.length; index += 3) {
      const luminance =
        pixels[index] * 0.2126 +
        pixels[index + 1] * 0.7152 +
        pixels[index + 2] * 0.0722;
      mask.push(luminance < pass.threshold ? 1 : 0);
    }

    const result = TraceSkeleton.fromBoolArray(mask, width, height);
    const polylines = ordered(
      choosePolylines(result.polylines, pass.limit),
      chapter.direction,
    );
    const paths = polylines.map((polyline, index) => {
      const d = polyline
        .map(([x, y], pointIndex) =>
          `${pointIndex === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`,
        )
        .join(" ");
      return `    <path id="${chapter.id}-${pass.threshold}-${index}" pathLength="1" d="${d}"/>`;
    });
    pathCount += paths.length;
    groups.push(
      `  <g data-threshold="${pass.threshold}" fill="none" stroke="#0f4d9a" stroke-width="${pass.strokeWidth}" stroke-opacity="${pass.opacity}" stroke-linecap="round" stroke-linejoin="round">\n${paths.join("\n")}\n  </g>`,
    );
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Hand-drawn contours for ${chapter.id}">\n${groups.join("\n")}\n</svg>\n`;
  const output = `${outputDirectory}/${chapter.id}.svg`;
  await writeFile(output, svg, "utf8");
  manifest.push({ ...chapter, pathCount, output });
  console.log(`${chapter.id}: ${pathCount} contour paths`);
}

await writeFile(
  `${outputDirectory}/manifest.json`,
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);
