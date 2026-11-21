#!/usr/bin/env node
/**
 * Rewrite file: sibling deps to published versions before npm publish.
 * Usage (cwd = packages/<dir>): node ../../scripts/rewrite-file-deps-for-publish.mjs
 */
import fs from "node:fs";
import path from "node:path";

const pkgPath = "package.json";
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

function rewrite(deps) {
  if (!deps) return;
  for (const [name, ver] of Object.entries(deps)) {
    if (typeof ver !== "string" || !ver.startsWith("file:")) continue;
    const rel = ver.replace(/^file:/, "");
    const siblingPkg = path.resolve(rel, "package.json");
    const sibling = JSON.parse(fs.readFileSync(siblingPkg, "utf8"));
    if (sibling.name !== name) {
      console.warn(`warn: dep key ${name} != sibling name ${sibling.name}`);
    }
    deps[name] = sibling.version;
    console.log(`rewrite ${name}: ${ver} -> ${sibling.version}`);
  }
}

rewrite(pkg.dependencies);
rewrite(pkg.optionalDependencies);
rewrite(pkg.devDependencies);
fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
