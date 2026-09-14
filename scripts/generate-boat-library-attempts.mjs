import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { promisify } from "node:util";

import { convertFile } from "@visioncortex/vtracer";
import ImageTracer from "imagetracerjs";
import potrace from "potrace";
import sharp from "sharp";
import TraceSkeleton from "skeleton-tracing-js";

const run = promisify(execFile);
const source = "public/art/parallax/05-boat.png";
const outputDirectory = "public/art/parallax-svg/experiments";
const flattenedSource = `${outputDirectory}/05-boat-on-ivory.png`;
const traceCrop = { left: 1584, top: 586, width: 64, height: 170 };

await mkdir(outputDirectory, { recursive: true });

await sharp(source)
  .flatten({ background: "#fbf7e9" })
  .png()
  .toFile(flattenedSource);

await convertFile(source, `${outputDirectory}/05-boat-vtracer-detailed.svg`, {
  preset: "photo",
  clustering: "color-cluster",
  hierarchical: "cutout",
  mode: "spline",
  filterSpeckle: 0,
  colorPrecision: 8,
  layerDifference: 1,
  lengthThreshold: 3.5,
  maxIterations: 20,
  simplify: 0.1,
  pathPrecision: 4,
  optimize: 0,
});

await convertFile(source, `${outputDirectory}/05-boat-vtracer-toile.svg`, {
  preset: "poster",
  clustering: "color-cluster",
  hierarchical: "cutout",
  mode: "spline",
  filterSpeckle: 1,
  colorPrecision: 6,
  layerDifference: 8,
  lengthThreshold: 3.5,
  maxIterations: 20,
  simplify: 0.35,
  pathPrecision: 4,
  palette: ["#fbf7e9", "#8eb0dc", "#3e76bd", "#0f4d9a"],
  maxColors: 8,
  optimize: 0,
});

await convertFile(source, `${outputDirectory}/05-boat-vtracer-balanced.svg`, {
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
  pathPrecision: 3,
  optimize: 0,
  palette: ["#fbf7e9", "#8eb0dc", "#3e76bd", "#0f4d9a"],
});

const { data, info } = await sharp(source)
  .extract(traceCrop)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const imageTracerSvg = ImageTracer.imagedataToSVG(
  { width: info.width, height: info.height, data: new Uint8ClampedArray(data) },
  {
    ltres: 0.01,
    qtres: 0.01,
    pathomit: 0,
    rightangleenhance: false,
    colorsampling: 2,
    numberofcolors: 128,
    mincolorratio: 0,
    colorquantcycles: 8,
    layering: 0,
    strokewidth: 0,
    linefilter: false,
    scale: 1,
    roundcoords: 3,
    viewbox: true,
    desc: true,
    blurradius: 0,
  },
);

const imageTracerPaths = imageTracerSvg
  .replace(/^<svg[^>]*>/i, "")
  .replace(/<\/svg>\s*$/i, "");

await writeFile(
  `${outputDirectory}/05-boat-imagetracer-detailed.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="1672" height="941" viewBox="0 0 1672 941" role="img" aria-label="Sailboat traced with ImageTracerJS"><g transform="translate(${traceCrop.left} ${traceCrop.top})">${imageTracerPaths}</g></svg>`,
  "utf8",
);

const potraceSvg = await new Promise((resolve, reject) => {
  potrace.posterize(
    flattenedSource,
    {
      threshold: 248,
      steps: [80, 110, 140, 170, 200, 220, 235, 248],
      blackOnWhite: true,
      color: "#0f4d9a",
      background: potrace.Posterizer.COLOR_TRANSPARENT,
      fillStrategy: potrace.Posterizer.FILL_MEAN,
      turdSize: 0,
      alphaMax: 1,
      optCurve: true,
      optTolerance: 0.05,
      turnPolicy: potrace.Potrace.TURNPOLICY_MINORITY,
    },
    (error, svg) => (error ? reject(error) : resolve(svg)),
  );
});

await writeFile(
  `${outputDirectory}/05-boat-potrace-8-level.svg`,
  potraceSvg,
  "utf8",
);

await run(
  "node_modules/.bin/vecline",
  [
    "centerline",
    flattenedSource,
    "--output",
    `${outputDirectory}/05-boat-vecline-centerline.svg`,
    "--threshold",
    "238",
    "--stroke-width",
    "0.72",
    "--stroke",
    "#0f4d9a",
    "--simplify",
    "0.15",
    "--min-length",
    "1",
  ],
  { maxBuffer: 16 * 1024 * 1024 },
);

const cropPixels = await sharp(flattenedSource)
  .extract(traceCrop)
  .removeAlpha()
  .raw()
  .toBuffer();
const skeletonPasses = [
  { threshold: 238, width: 0.5, opacity: 0.2 },
  { threshold: 210, width: 0.55, opacity: 0.27 },
  { threshold: 175, width: 0.62, opacity: 0.38 },
  { threshold: 130, width: 0.72, opacity: 0.58 },
];
const skeletonGroups = [];

for (const pass of skeletonPasses) {
  const mask = [];

  for (let index = 0; index < cropPixels.length; index += 3) {
    const luminance =
      cropPixels[index] * 0.2126 +
      cropPixels[index + 1] * 0.7152 +
      cropPixels[index + 2] * 0.0722;
    mask.push(luminance < pass.threshold ? 1 : 0);
  }

  const result = TraceSkeleton.fromBoolArray(mask, traceCrop.width, traceCrop.height);
  const paths = result.polylines
    .filter((polyline) => polyline.length > 1)
    .map((polyline, index) => {
      const d = polyline
        .map(([x, y], pointIndex) =>
          `${pointIndex === 0 ? "M" : "L"}${(x + traceCrop.left).toFixed(2)} ${(y + traceCrop.top).toFixed(2)}`,
        )
        .join(" ");
      return `    <path id="skeleton-${pass.threshold}-${index}" pathLength="1" d="${d}"/>`;
    });

  skeletonGroups.push(
    `  <g data-threshold="${pass.threshold}" fill="none" stroke="#0f4d9a" stroke-width="${pass.width}" stroke-opacity="${pass.opacity}" stroke-linecap="round" stroke-linejoin="round">\n${paths.join("\n")}\n  </g>`,
  );
}

await writeFile(
  `${outputDirectory}/05-boat-skeleton-tracing-multipass.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="1672" height="941" viewBox="0 0 1672 941" role="img" aria-label="Sailboat traced with skeleton-tracing-js">\n${skeletonGroups.join("\n")}\n</svg>\n`,
  "utf8",
);

const files = [
  "05-boat-vtracer-detailed.svg",
  "05-boat-vtracer-toile.svg",
  "05-boat-vtracer-balanced.svg",
  "05-boat-imagetracer-detailed.svg",
  "05-boat-potrace-8-level.svg",
  "05-boat-vecline-centerline.svg",
  "05-boat-skeleton-tracing-multipass.svg",
];

const manifest = [];

for (const file of files) {
  const contents = await readFile(`${outputDirectory}/${file}`, "utf8");
  manifest.push({
    file,
    bytes: Buffer.byteLength(contents),
    paths: (contents.match(/<path\b/g) ?? []).length,
    fills: (contents.match(/\bfill=/g) ?? []).length,
    strokes: (contents.match(/\bstroke=/g) ?? []).length,
  });
}

await writeFile(
  `${outputDirectory}/manifest.json`,
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);

const previewCrop = { left: 1578, top: 580, width: 74, height: 180 };
const previewWidth = 444;
const previewHeight = 1080;
const referencePreview = "05-boat-png-reference-preview.png";

await sharp(flattenedSource)
  .extract(previewCrop)
  .resize(previewWidth, previewHeight, { kernel: "lanczos3" })
  .png()
  .toFile(`${outputDirectory}/${referencePreview}`);

for (const file of files) {
  const preview = file.replace(".svg", "-preview.png");
  const rendered = await sharp(`${outputDirectory}/${file}`, { density: 96 })
    .resize(1672, 941)
    .flatten({ background: "#fbf7e9" })
    .png()
    .toBuffer();

  await sharp(rendered)
    .extract(previewCrop)
    .resize(previewWidth, previewHeight, { kernel: "lanczos3" })
    .png()
    .toFile(`${outputDirectory}/${preview}`);
}

const comparisonEntries = [
  { label: "PNG reference", preview: referencePreview, href: "/art/parallax/05-boat.png" },
  ...files.map((file) => ({
    label: file
      .replace("05-boat-", "")
      .replace(".svg", "")
      .replaceAll("-", " "),
    preview: file.replace(".svg", "-preview.png"),
    href: `./${file}`,
  })),
];

const comparisonCards = comparisonEntries
  .map(
    ({ label, preview, href }) => `
      <a class="card" href="${href}">
        <img src="./${preview}" alt="${label}">
        <span>${label}</span>
      </a>`,
  )
  .join("");

await writeFile(
  `${outputDirectory}/comparison.html`,
  `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Boat vectorization library comparison</title>
  <style>
    *{box-sizing:border-box}body{margin:0;background:#fbf7e9;color:#0f4d9a;font:14px/1.35 system-ui,sans-serif}
    main{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1px;background:#d9d1bf}
    .card{display:grid;grid-template-rows:minmax(0,1fr) auto;min-height:100vh;background:#fbf7e9;color:inherit;text-decoration:none;overflow:hidden}
    img{width:100%;height:calc(100vh - 42px);object-fit:contain;image-rendering:auto}
    span{padding:11px 14px;text-align:center;border-top:1px solid #d9d1bf;text-transform:capitalize}
  </style>
</head>
<body><main>${comparisonCards}</main></body>
</html>
`,
  "utf8",
);

console.table(manifest);
