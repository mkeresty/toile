import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = process.cwd();
const dataPath = resolve(projectRoot, "lib/boat-vector-v3.json");
const outputPath = resolve(projectRoot, "public/art/parallax-svg/05-boat-v3.svg");
const boat = JSON.parse(await readFile(dataPath, "utf8"));

const escapeAttribute = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const lines = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="1672" height="941" viewBox="0 0 1672 941" role="img" aria-labelledby="boat-title boat-desc" shape-rendering="geometricPrecision">',
  '  <title id="boat-title">Toile sailboat</title>',
  '  <desc id="boat-desc">A hand-drawn sailboat composed of independently drawable ink paths. Blue is used only for strokes; ivory shapes mask the scene behind the boat.</desc>',
  '  <g id="boat-paper-masks" fill="#fbf7e9">',
  ...boat.paperMasks.map(
    (mask) =>
      `    <path id="boat-${escapeAttribute(mask.id)}" data-part="paper-mask" d="${escapeAttribute(mask.d)}"/>`,
  ),
  "  </g>",
];

for (const group of boat.strokeGroups) {
  lines.push(
    `  <g id="boat-${escapeAttribute(group.id)}" fill="none" stroke="${escapeAttribute(group.stroke)}" stroke-linecap="round" stroke-linejoin="round">`,
  );

  for (const path of group.paths) {
    const attributes = [
      `id="boat-${escapeAttribute(path.id)}"`,
      `data-part="${escapeAttribute(path.part)}"`,
      'pathLength="1"',
      'fill="none"',
      `d="${escapeAttribute(path.d)}"`,
      `stroke-width="${path.width}"`,
    ];

    if (path.stroke && path.stroke !== group.stroke) {
      attributes.push(`stroke="${escapeAttribute(path.stroke)}"`);
    }

    if (path.opacity !== undefined && path.opacity !== 1) {
      attributes.push(`opacity="${path.opacity}"`);
    }

    lines.push(`    <path ${attributes.join(" ")}/>`);
  }

  lines.push("  </g>");
}

lines.push("</svg>", "");
await writeFile(outputPath, lines.join("\n"), "utf8");
console.log(`Generated ${outputPath}`);
