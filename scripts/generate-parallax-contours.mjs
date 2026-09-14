import { mkdir, writeFile } from "node:fs/promises";

import sharp from "sharp";
import TraceSkeleton from "skeleton-tracing-js";

const width = 1672;
const height = 941;
const outputDirectory = "public/art/parallax-svg/contours";
const layers = [
  { id: "water", file: "01-water.png" },
  { id: "left-land-underlay", file: "02-left-land-underlay.png" },
  { id: "left-gap-bushes", file: "02b-left-gap-bushes.png" },
  { id: "mountains", file: "03-distant-mountains.png" },
  { id: "background-village", file: "04-background-village-and-plants.png" },
  { id: "boat", file: "05-boat.png" },
  { id: "main-villa", file: "06-main-villa-and-attached-plants.png" },
  { id: "left-wall", file: "07-left-stone-wall.png" },
  { id: "foreground-plants", file: "08-foreground-olive-branches.png" },
];
const passes = [
  { threshold: 220, strokeWidth: 0.9, opacity: 0.38, limit: 520 },
  { threshold: 160, strokeWidth: 1.08, opacity: 0.58, limit: 520 },
];

function choosePolylines(polylines, limit) {
  const eligible = polylines.filter((polyline) => polyline.length >= 5);
  if (eligible.length <= limit) return eligible;

  const longestCount = Math.floor(limit * 0.55);
  const longest = [...eligible]
    .sort((a, b) => b.length - a.length)
    .slice(0, longestCount);
  const selected = new Set(longest);
  const remainder = eligible.filter((polyline) => !selected.has(polyline));
  const sampleCount = limit - longest.length;
  const sampled = Array.from({ length: sampleCount }, (_, index) =>
    remainder[Math.floor(index * remainder.length / sampleCount)],
  ).filter(Boolean);

  return [...longest, ...sampled];
}

await mkdir(outputDirectory, { recursive: true });
const manifest = [];

for (const layer of layers) {
  const source = `public/art/parallax/${layer.file}`;
  const { info: trimInfo } = await sharp(source)
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer({ resolveWithObject: true });
  const bounds = {
    left: Math.max(0, -trimInfo.trimOffsetLeft - 2),
    top: Math.max(0, -trimInfo.trimOffsetTop - 2),
    width: Math.min(width, trimInfo.width + 4),
    height: Math.min(height, trimInfo.height + 4),
  };
  bounds.width = Math.min(bounds.width, width - bounds.left);
  bounds.height = Math.min(bounds.height, height - bounds.top);

  const pixels = await sharp(source)
    .flatten({ background: "#fbf7e9" })
    .extract(bounds)
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

    const result = TraceSkeleton.fromBoolArray(mask, bounds.width, bounds.height);
    const polylines = choosePolylines(result.polylines, pass.limit);
    const paths = polylines.map((polyline, index) => {
      const d = polyline
        .map(([x, y], pointIndex) =>
          `${pointIndex === 0 ? "M" : "L"}${(x + bounds.left).toFixed(2)} ${(y + bounds.top).toFixed(2)}`,
        )
        .join(" ");
      return `    <path id="${layer.id}-${pass.threshold}-${index}" pathLength="1" d="${d}"/>`;
    });
    pathCount += paths.length;
    groups.push(
      `  <g data-threshold="${pass.threshold}" fill="none" stroke="#0f4d9a" stroke-width="${pass.strokeWidth}" stroke-opacity="${pass.opacity}" stroke-linecap="butt" stroke-linejoin="round">\n${paths.join("\n")}\n  </g>`,
    );
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Noisy contours for ${layer.id}">\n${groups.join("\n")}\n</svg>\n`;
  const output = `${outputDirectory}/${layer.id}.svg`;
  await writeFile(output, svg, "utf8");
  manifest.push({ ...layer, bounds, pathCount, output });
  console.log(`${layer.id}: ${pathCount} contour paths`);
}

await writeFile(
  `${outputDirectory}/manifest.json`,
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);
