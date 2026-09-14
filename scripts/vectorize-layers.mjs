import { convertFile } from "@visioncortex/vtracer";
import { mkdir } from "node:fs/promises";

const layers = ["mountains", "left-architecture-alpha", "right-village-alpha", "water-alpha", "vegetation-alpha", "foreground"];
await mkdir("public/art/vector", { recursive: true });

for (const layer of layers) {
  const name = layer.replace("-alpha", "");
  await convertFile(`public/art/layers/${layer}.png`, `public/art/vector/${name}.svg`, {
    preset: "poster",
    clustering: "color-cluster",
    hierarchical: "cutout",
    mode: "polygon",
    filterSpeckle: 5,
    colorPrecision: 3,
    layerDifference: 24,
    lengthThreshold: 5,
    simplify: 2.2,
    maxColors: 4,
    pathPrecision: 1,
    optimize: 2,
  });
  console.log(`vectorized ${name}`);
}
