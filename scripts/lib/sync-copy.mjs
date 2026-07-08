/**
 * Shared recursive copy for package sync scripts (skips node_modules, .git).
 */
import fs from 'node:fs'
import path from 'node:path'

const DEFAULT_SKIP = new Set(['node_modules', '.git', 'dist', '.cache'])

export function copyRecursive(from, to, skip = DEFAULT_SKIP) {
  fs.mkdirSync(to, { recursive: true })
  for (const name of fs.readdirSync(from)) {
    if (skip.has(name)) continue
    const src = path.join(from, name)
    const dest = path.join(to, name)
    if (fs.statSync(src).isDirectory()) copyRecursive(src, dest, skip)
    else fs.copyFileSync(src, dest)
  }
}

export function listFilesRecursive(root, skip = DEFAULT_SKIP) {
  const out = []
  if (!fs.existsSync(root)) return out
  for (const name of fs.readdirSync(root)) {
    if (skip.has(name)) continue
    const full = path.join(root, name)
    const rel = path.relative(root, full)
    if (fs.statSync(full).isDirectory()) out.push(...listFilesRecursive(full, skip).map((p) => path.join(rel, p)))
    else out.push(rel)
  }
  return out.sort()
}
