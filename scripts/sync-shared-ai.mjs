/**
 * Sync packages/shared-ai → platform service mirrors.
 * Usage: node scripts/sync-shared-ai.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { copyRecursive } from './lib/sync-copy.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const src = path.join(root, 'packages', 'shared-ai')

const targets = [
  path.join(root, 'internal', 'packages'),
  path.join(root, 'billing', 'packages'),
  path.join(root, 'search', 'packages'),
  path.join(root, 'notifications', 'packages'),
  path.join(root, 'platform', 'core', 'packages'),
]

if (!fs.existsSync(src)) {
  console.error('[sync-shared-ai] Missing source:', src)
  process.exit(1)
}

let ok = 0
for (const destRoot of targets) {
  if (!fs.existsSync(path.dirname(destRoot))) {
    console.warn('[sync-shared-ai] SKIP (no service dir):', destRoot)
    continue
  }
  fs.mkdirSync(destRoot, { recursive: true })
  const dest = path.join(destRoot, 'shared-ai')
  copyRecursive(src, dest)
  console.log('[sync-shared-ai] OK:', dest)
  ok += 1
}

if (ok === 0) {
  console.error('[sync-shared-ai] No targets synced.')
  process.exit(1)
}

console.log(`[sync-shared-ai] Done — ${ok} destination(s).`)
