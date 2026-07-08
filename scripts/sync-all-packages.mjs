#!/usr/bin/env node
/**
 * Run all DES / experience / shared-ai sync scripts in order.
 * Usage: node scripts/sync-all-packages.mjs
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const steps = [
  'sync-des-packages.mjs',
  'sync-experience.mjs',
  'sync-shared-brand.mjs',
  'sync-shared-ai.mjs',
]

for (const script of steps) {
  const scriptPath = path.join(root, 'scripts', script)
  console.log(`\n▶ node scripts/${script}`)
  const r = spawnSync('node', [scriptPath], { stdio: 'inherit', cwd: root })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

console.log('\n[sync-all-packages] All sync steps completed.')
