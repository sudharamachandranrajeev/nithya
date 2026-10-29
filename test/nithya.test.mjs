// Checks that the catalogue matches the files on disk, and that picks produce working kits.
//   node --test 'test/*.test.mjs'

import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { run } from '../nithya.mjs'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'catalog.json'), 'utf8'))
const read = (...p) => fs.readFileSync(path.join(...p), 'utf8')
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'nithya-pick-'))

test('every catalogue path exists', () => {
  for (const kit of catalog.kits) {
    const dir = path.join(root, kit.path)
    for (const f of [kit.tokens, kit.build]) assert.ok(fs.existsSync(path.join(dir, f)), `${kit.id}: ${f}`)
    for (const [id, r] of Object.entries(kit.runtimes)) {
      for (const f of [...r.files, ...(r.exclude ?? [])]) assert.ok(fs.existsSync(path.join(dir, f)), `${kit.id}/${id}: ${f}`)
    }
  }
  for (const p of catalog.patterns) assert.ok(fs.existsSync(path.join(root, p.doc)), p.doc)
})

test('each component is in the files it names', () => {
  for (const c of catalog.components) {
    const kit = catalog.kits.find((k) => k.id === c.kit)
    assert.ok(kit, `${c.id}: no kit ${c.kit}`)
    for (const f of c.files) {
      // A Svelte component is named by its file.
      if (f.endsWith('.svelte')) { assert.equal(path.basename(f), `${c.name}.svelte`, c.id); continue }
      const text = read(root, kit.path, f)
      // Flutter names carry a Nithya prefix or a lower-case first letter (nithyaTheme).
      assert.ok(text.includes(c.name) || text.includes(`Nithya${c.name}`) || text.toLowerCase().includes(c.name.toLowerCase()), `${c.id} not in ${f}`)
    }
  }
})

test('every Calm component export and every pattern note is listed', () => {
  const exported = [...read(root, 'kits/calm/src/index.ts').matchAll(/default as (\w+)/g)].map((m) => m[1])
  const listed = catalog.components.filter((c) => c.kit === 'calm').map((c) => c.name)
  assert.deepEqual([...listed].sort(), [...exported].sort())
  const notes = fs.readdirSync(path.join(root, 'patterns')).map((f) => `patterns/${f}`)
  assert.deepEqual(catalog.patterns.map((p) => p.doc).sort(), notes.sort())
})

test('ids are unique', () => {
  const ids = [...catalog.kits, ...catalog.components, ...catalog.patterns].map((e) => e.id)
  assert.equal(new Set(ids).size, ids.length)
})

test('list reads themes from the token files', () => {
  const out = run(['list', 'themes'])
  for (const id of ['studio/dusk', 'studio/ember', 'calm/sage', 'calm/aurora', 'calm/journal']) assert.match(out, new RegExp(id))
  assert.match(out, /calm\/sage\s+light \+ dark, default/)
})

test('show finds short names and refuses ambiguous ones', () => {
  assert.match(run(['show', 'aurora']), /theme calm\/aurora/)
  assert.match(run(['show', 'calm-motion']), /prefers-reduced-motion/)
  assert.throws(() => run(['show', 'button']), /calm\/button, studio\/button/)
  assert.throws(() => run(['show', 'nope']), /Nothing called "nope"/)
})

test('pick calm keeps the chosen themes in order and the copy works on its own', () => {
  const dest = path.join(tmp(), 'ui')
  run(['pick', 'calm', dest, '--themes', 'aurora,journal'])
  const tokens = JSON.parse(read(dest, 'tokens/calm.tokens.json'))
  assert.deepEqual(Object.keys(tokens.themes), ['aurora', 'journal'])
  const css = read(dest, 'src/generated/themes.css')
  assert.match(css, /\[data-theme="aurora"\]/)
  assert.doesNotMatch(css, /\[data-theme="sage"\]/)
  assert.match(read(dest, 'src/generated/tokens.ts'), /defaultTheme = "aurora"/)
  const pkg = JSON.parse(read(dest, 'package.json'))
  assert.equal(pkg.scripts.dev, undefined)
  assert.equal(pkg.devDependencies, undefined)
  assert.ok(fs.existsSync(path.join(dest, 'LICENSE')))
  assert.match(read(dest, 'NITHYA.md'), /Themes: aurora, journal \(default: aurora\)/)
  assert.ok(!fs.existsSync(path.join(dest, 'node_modules')))
  assert.ok(!fs.existsSync(path.join(dest, 'demo')))
  execFileSync(process.execPath, ['scripts/build.mjs', '--check'], { cwd: dest, stdio: 'pipe' })
  execFileSync(process.execPath, ['--test', 'test/calm.test.ts'], { cwd: dest, stdio: 'pipe' })
})

test('pick studio for React leaves Flutter code and tests behind', () => {
  const dest = tmp()
  run(['pick', 'studio', dest, '--runtime', 'react', '--themes', 'ember,dusk'])
  assert.match(read(dest, 'web/src/nithya/tokens.ts'), /themeNames = \['ember', 'dusk'\]/)
  assert.ok(fs.existsSync(path.join(dest, 'flutter/assets/fonts/Inter-Regular.ttf')))
  assert.ok(!fs.existsSync(path.join(dest, 'flutter/lib')))
  assert.ok(!fs.existsSync(path.join(dest, 'web/src/nithya/nithya.test.tsx')))
  execFileSync(process.execPath, ['tokens/build.mjs', '--check'], { cwd: dest, stdio: 'pipe' })
})

test('pick studio for Flutter skips the demo app', () => {
  const dest = tmp()
  run(['pick', 'studio', dest, '--runtime', 'flutter', '--themes', 'daylight'])
  assert.match(read(dest, 'flutter/lib/src/tokens.g.dart'), /'daylight': NithyaPalette/)
  assert.doesNotMatch(read(dest, 'flutter/lib/src/tokens.g.dart'), /'dusk': NithyaPalette/)
  assert.ok(!fs.existsSync(path.join(dest, 'flutter/example')))
  assert.ok(!fs.existsSync(path.join(dest, 'web')))
})

test('pick refuses bad input and never writes into a full folder', () => {
  const full = tmp()
  fs.writeFileSync(path.join(full, 'keep.txt'), 'mine')
  assert.throws(() => run(['pick', 'calm', full]), /not empty/)
  assert.deepEqual(fs.readdirSync(full), ['keep.txt'])
  assert.throws(() => run(['pick', 'studio', path.join(tmp(), 'x')]), /more than one runtime/)
  assert.throws(() => run(['pick', 'calm', path.join(tmp(), 'x'), '--themes', 'sage,neon']), /no theme neon/)
  assert.throws(() => run(['pick', 'nope', path.join(tmp(), 'x')]), /No kit "nope"/)
})
