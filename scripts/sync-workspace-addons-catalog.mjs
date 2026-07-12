#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = path.join(root, 'projects/workspace/catalog/workspace-addons.json')
const dest = path.join(root, 'packages/shared-brand/src/workspace-addons.json')
const clientDest = path.join(root, 'apps/akoenet/Client/src/workspace/catalog.json')
const serverDest = path.join(root, 'apps/akoenet/Server/src/data/workspace-addons.json')

const json = fs.readFileSync(src, 'utf8')
fs.writeFileSync(dest, json)
try {
  fs.mkdirSync(path.dirname(clientDest), { recursive: true })
  fs.writeFileSync(clientDest, json)
} catch {
  /* akoenet clone optional */
}
try {
  fs.mkdirSync(path.dirname(serverDest), { recursive: true })
  fs.writeFileSync(serverDest, json)
} catch {
  /* akoenet clone optional */
}
console.log('Synced workspace-addons catalog → shared-brand + akoenet Client + Server')
