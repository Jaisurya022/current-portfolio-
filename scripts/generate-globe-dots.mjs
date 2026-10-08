// Generates public/globe-dots.json: evenly spaced points on land, used by the 3D globe.
// Run once with:  node scripts/generate-globe-dots.mjs
// (needs the devDependencies world-atlas, topojson-client, d3-geo)
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { feature } from "topojson-client";
import { geoContains } from "d3-geo";

const require = createRequire(import.meta.url);
const topo = JSON.parse(readFileSync(require.resolve("world-atlas/land-110m.json"), "utf8"));
const land = feature(topo, topo.objects.land);

const N = Number(process.argv[2] || 42000); // points on the whole sphere
const golden = Math.PI * (3 - Math.sqrt(5));
const out = [];
for (let i = 0; i < N; i++) {
  const y = 1 - (i / (N - 1)) * 2;
  const theta = golden * i;
  const lat = (Math.asin(y) * 180) / Math.PI;
  const lng = ((((theta * 180) / Math.PI) % 360) + 540) % 360 - 180;
  if (lat < -60) continue; // skip Antarctica, it only adds noise at the bottom
  if (geoContains(land, [lng, lat])) out.push(+lat.toFixed(2), +lng.toFixed(2));
}
writeFileSync(new URL("../public/globe-dots.json", import.meta.url), JSON.stringify(out));
console.log(`wrote ${out.length / 2} land dots`);
