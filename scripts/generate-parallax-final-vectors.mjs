import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";

import { convertFile } from "@visioncortex/vtracer";

const sourceDirectory = "public/art/parallax";
const outputDirectory = "public/art/parallax-svg/final";
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

const detailedSettings = {
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
};

await mkdir(outputDirectory, { recursive: true });
const manifest = [];

for (const layer of layers) {
  const source = `${sourceDirectory}/${layer.file}`;
  const output = `${outputDirectory}/${layer.id}.svg`;
  console.log(`Tracing ${layer.id}...`);

  // Preserve the already approved boat vector byte-for-byte.
  if (layer.id === "boat") {
    await copyFile(
      "public/art/parallax-svg/experiments/05-boat-vtracer-detailed.svg",
      output,
    );
  } else {
    await convertFile(source, output, detailedSettings);
  }

  const contents = await readFile(output, "utf8");
  const entry = {
    id: layer.id,
    source,
    output,
    bytes: Buffer.byteLength(contents),
    paths: (contents.match(/<path\b/g) ?? []).length,
  };
  manifest.push(entry);
  console.log(`${layer.id}: ${entry.paths.toLocaleString()} paths, ${(entry.bytes / 1024 / 1024).toFixed(1)} MB`);
}

await writeFile(
  `${outputDirectory}/manifest.json`,
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);
