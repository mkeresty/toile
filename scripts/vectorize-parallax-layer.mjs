import { convertFile } from "@visioncortex/vtracer";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const input = process.argv[2] ?? "public/art/parallax/05-boat.png";
const output = process.argv[3] ?? "public/art/parallax-svg/05-boat.svg";

await mkdir(new URL("../public/art/parallax-svg/", import.meta.url), { recursive: true });

await convertFile(input, output, {
  preset: "poster",
  clustering: "color-cluster",
  hierarchical: "cutout",
  mode: "spline",
  filterSpeckle: 3,
  colorPrecision: 5,
  layerDifference: 16,
  lengthThreshold: 3,
  simplify: 1.15,
  maxColors: 5,
  pathPrecision: 2,
  optimize: 2,
  palette: ["#fbf7e9", "#8eb0dc", "#3e76bd", "#0f4d9a"],
});

let svg = await readFile(output, "utf8");
svg = svg
  .replace(/<\?xml[^>]*>\s*/i, "")
  .replace(/<!--[^]*?-->\s*/g, "")
  .replace("<svg ", '<svg class="boat-vector" viewBox="0 0 1672 941" role="img" aria-label="Sailboat" ')
  .replace(/ width="1672" height="941"/, "")
  .replace(/<path /g, '<path class="vector-shape" ');

const paths = [...svg.matchAll(/<path class="vector-shape" d="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((d) => !/h0Z$|v0Z$|^M[\d.,-]+h0Z$/.test(d));

const drawingPaths = paths
  .map((d, index) => `<path class="draw-path" pathLength="1" style="--path-index:${index}" d="${d}"/>`)
  .join("\n");

const openingEnd = svg.indexOf(">");
svg = `${svg.slice(0, openingEnd + 1)}
<style>
  .final-art{opacity:0;animation:fill-in .55s ease-out 2.55s forwards}
  .draw-path{fill:none;stroke:#0f4d9a;stroke-width:1.65;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke;stroke-dasharray:1;stroke-dashoffset:1;animation:draw-path 2.4s cubic-bezier(.45,0,.2,1) forwards;animation-delay:calc(var(--path-index) * 18ms)}
  @keyframes draw-path{to{stroke-dashoffset:0}}
  @keyframes fill-in{to{opacity:1}}
  @media (prefers-reduced-motion:reduce){.final-art{opacity:1;animation:none}.draw-layer{display:none}}
</style>
<g class="final-art">${svg.slice(openingEnd + 1).replace(/<\/svg>\s*$/, "")}</g>
<g class="draw-layer">${drawingPaths}</g>
</svg>`;

await writeFile(output, svg);
console.log(`vectorized ${input} -> ${output}`);
