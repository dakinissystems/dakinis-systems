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

for (const dir of dirs) {
  const pkgPath = path.join("packages", dir, "package.json");
  if (!fs.existsSync(pkgPath)) {
    console.error("missing", pkgPath);
    process.exit(1);
  }
  const j = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
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
  fs.writeFileSync(pkgPath, `${JSON.stringify(j, null, 2)}\n`);

  const readme = path.join("packages", dir, "README.md");
  if (!fs.existsSync(readme)) {
    fs.writeFileSync(
      readme,
      [
        `# \`${name}\``,
        "",
        "Published via GitHub Packages. See `docs/RUNBOOKS/npm-github-packages.md`.",
        "",
        "```bash",
        `npm install ${name}@${j.version}`,
        "```",
        "",
      ].join("\n"),
    );
  }
  console.log("ready", name, j.version);
}
