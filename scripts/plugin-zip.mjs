#!/usr/bin/env node
// Packages lightroom/meilechbiller.lrplugin into public/downloads so the admin
// Integrations page can link to it. Run after editing any plugin file.
import { readdirSync, readFileSync, mkdirSync, writeFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { zipSync } from "fflate";

const root = new URL("../", import.meta.url).pathname;
const src = join(root, "lightroom", "meilechbiller.lrplugin");
const outDir = join(root, "public", "downloads");
const out = join(outDir, "meilechbiller-lightroom.zip");

const files = {};
function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else files[`meilechbiller.lrplugin/${relative(src, full)}`] = readFileSync(full);
  }
}
walk(src);

mkdirSync(outDir, { recursive: true });
writeFileSync(out, zipSync(files, { level: 6 }));
console.log(`${relative(root, out)}: ${Object.keys(files).length} files, ${statSync(out).size} bytes`);
