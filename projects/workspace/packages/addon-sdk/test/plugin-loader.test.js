import assert from "node:assert/strict";
import test from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  discoverAddonManifests,
  buildRouteMapFromManifests,
} from "../src/plugin-loader.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const akoenetModules = path.resolve(
  __dirname,
  "../../../../../apps/akoenet/Client/src/modules",
);

test("discoverAddonManifests finds akoenet modules", () => {
  const discovered = discoverAddonManifests(akoenetModules);
  assert.ok(discovered.length >= 1);
  assert.ok(discovered.every((d) => d.manifest?.id));
});

test("buildRouteMapFromManifests maps route from manifest", () => {
  const discovered = discoverAddonManifests(akoenetModules);
  const routes = buildRouteMapFromManifests(discovered);
  const withRoute = discovered.filter((d) => d.manifest.route);
  for (const item of withRoute) {
    assert.equal(routes[item.id], item.manifest.route);
  }
});
