#!/usr/bin/env node
/**
 * Fail if vendored package copies drift from canonical packages/.
 * Usage: node scripts/verify-package-drift.mjs
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { listFilesRecursive } from './lib/sync-copy.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const packagesRoot = path.join(root, 'packages')

const checks = [
  { pkg: 'shared-brand', dests: ['finanzas/packages', 'hub/packages', 'platform/core/packages', 'apps/landing/packages'] },
  { pkg: 'shared-layouts', dests: ['finanzas/packages', 'hub/packages', 'platform/core/packages', 'apps/landing/packages'] },
  { pkg: 'shared-ux', dests: ['finanzas/packages', 'hub/packages', 'platform/core/packages'] },
  { pkg: 'shared-loading', dests: ['finanzas/packages', 'hub/packages', 'platform/core/packages'] },
  { pkg: 'shared-icons', dests: ['finanzas/packages', 'hub/packages', 'platform/core/packages'] },
  { pkg: 'shared-illustrations', dests: ['finanzas/packages', 'hub/packages', 'platform/core/packages'] },
  { pkg: 'shared-ai', dests: ['internal/packages', 'billing/packages', 'search/packages', 'notifications/packages'] },
  { pkg: 'akoenet-orchestrator', dests: ['internal/packages'] },
  { pkg: 'akoenet-modules', dests: ['internal/packages'] },
]

function hashTree(dir) {
  const files = listFilesRecursive(dir)
  const hash = crypto.createHash('sha256')
  for (const rel of files) {
    hash.update(rel)
    hash.update(fs.readFileSync(path.join(dir, rel)))
  }
  return hash.digest('hex')
}

const errors = []
let compared = 0

for (const { pkg, dests } of checks) {
  const src = path.join(packagesRoot, pkg)
  if (!fs.existsSync(src)) continue
  const srcHash = hashTree(src)
  for (const relDest of dests) {
    const dest = path.join(root, relDest, pkg)
    if (!fs.existsSync(dest)) continue
    compared += 1
    const destHash = hashTree(dest)
    if (srcHash !== destHash) {
      errors.push(`${relDest}/${pkg} drift — run: node scripts/sync-all-packages.mjs`)
    }
  }
}

if (errors.length) {
  console.error('[verify-package-drift] Drift detected:')
  for (const e of errors) console.error('  •', e)
  process.exit(1)
}

console.log(`[verify-package-drift] OK — ${compared} vendored copy/copies match canonical packages/`)
