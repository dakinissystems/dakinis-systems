/**
 * Sync packages/akoenet-orchestrator + akoenet-modules → internal/packages (Railway deploy).
 * Usage: node scripts/sync-akoenet-packages.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { copyRecursive } from './lib/sync-copy.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const destRoot = path.join(root, 'internal', 'packages')
const packages = ['akoenet-orchestrator', 'akoenet-modules']

if (!fs.existsSync(destRoot)) {
  console.error('[sync-akoenet-packages] Missing internal/packages — run from monorepo root')
  process.exit(1)
}

let ok = 0
for (const pkg of packages) {
  const src = path.join(root, 'packages', pkg)
  if (!fs.existsSync(src)) {
    console.error('[sync-akoenet-packages] Missing source:', src)
    process.exit(1)
  }
  const dest = path.join(destRoot, pkg)
  copyRecursive(src, dest)
  console.log('[sync-akoenet-packages] OK:', dest)
  ok += 1
}

if (ok === 0) process.exit(1)
console.log(`[sync-akoenet-packages] Synced ${ok} package(s) to internal/packages`)
