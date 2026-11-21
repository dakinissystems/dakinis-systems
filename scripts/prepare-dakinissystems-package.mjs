#!/usr/bin/env node
/**
 * Prepare packages/<dir>/package.json for GitHub Packages (@dakinissystems/*).
 * Usage: node scripts/prepare-dakinissystems-package.mjs domain shared-loading shared-db
 */
import fs from "node:fs";
import path from "node:path";

const dirs = process.argv.slice(2);
if (dirs.length === 0) {
  console.error("Usage: prepare-dakinissystems-package.mjs <dir>...");
  process.exit(1);
}

const readmeBody = (name, version) =>
  [
    `# \`${name}\``,
    "",
    "Published via GitHub Packages. See `docs/RUNBOOKS/npm-github-packages.md`.",
    "",
    "```bash",
    `npm install ${name}@${version}`,
    "```",
    "",
  ].join("\n");

for (const dir of dirs) {
  const pkgPath = path.join("packages", dir, "package.json");
  let raw;
  try {
    raw = fs.readFileSync(pkgPath, "utf8");
  } catch (err) {
    if (err && err.code === "ENOENT") {
      console.error("missing", pkgPath);
      process.exit(1);
    }
    throw err;
  }

  const j = JSON.parse(raw);
  const name = `@dakinissystems/${dir}`;
  delete j.private;
  j.name = name;
  j.files = j.files || ["src"];
  j.publishConfig = {
    registry: "https://npm.pkg.github.com",
    access: "restricted",
  };
  j.repository = {
    type: "git",
    url: "git+https://github.com/dakinissystems/dakinis-systems.git",
    directory: `packages/${dir}`,
  };
  j.license = j.license || "UNLICENSED";
  if (!j.description) j.description = `Dakinis package ${name}`;

  // Atomic replace: write temp then rename (avoids existsSync→write TOCTOU).
  const tmpPkg = `${pkgPath}.${process.pid}.tmp`;
  fs.writeFileSync(tmpPkg, `${JSON.stringify(j, null, 2)}\n`);
  fs.renameSync(tmpPkg, pkgPath);

  const readme = path.join("packages", dir, "README.md");
  try {
    // 'wx' fails if the file already exists — no existsSync race.
    fs.writeFileSync(readme, readmeBody(name, j.version), { flag: "wx" });
  } catch (err) {
    if (!err || err.code !== "EEXIST") throw err;
  }

  console.log("ready", name, j.version);
}
