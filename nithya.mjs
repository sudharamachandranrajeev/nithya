#!/usr/bin/env node
// Nithya catalogue: browse kits, themes, components and patterns, and copy a kit into an app.
//   node nithya.mjs                          overview of every category
//   node nithya.mjs list [category]          kits | themes | components | patterns
//   node nithya.mjs show <id>                details, e.g. calm, calm/aurora, studio/button, calm-motion
//   node nithya.mjs pick <kit> <dest> [--runtime <name>] [--themes a,b]
//                                            copy a kit into <dest>; the first theme becomes the default

import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'catalog.json'), 'utf8'))
const categories = Object.keys(catalog.categories)

// Build output and installed packages never travel with a pick.
const SKIP = new Set(['node_modules', 'build', 'dist', '.dart_tool', 'target', 'generated-schemas'])

class Refusal extends Error {}
const fail = (msg) => { throw new Refusal(msg) }

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const kitTokens = (kit) => readJson(path.join(root, kit.path, kit.tokens))

function themes() {
  return catalog.kits.flatMap((kit) =>
    Object.entries(kitTokens(kit).themes).map(([id, t], i) => ({
      id: `${kit.id}/${id}`,
      kit: kit.id,
      name: t.label,
      summary: t.description ?? '',
      modes: t.modes ? Object.keys(t.modes).join(' + ') : t.brightness,
      isDefault: i === 0,
    })),
  )
}

const items = (category) => (category === 'themes' ? themes() : catalog[category])

/** Finds an entry by full id, or by a short id or name when only one entry matches. */
function find(query) {
  const q = query.toLowerCase()
  const all = categories.flatMap((c) => items(c).map((e) => ({ ...e, category: c })))
  const exact = all.filter((e) => e.id.toLowerCase() === q)
  if (exact.length === 1) return exact[0]
  const loose = all.filter((e) => e.id.toLowerCase().split('/').at(-1) === q || e.name.toLowerCase() === q)
  if (loose.length === 1) return loose[0]
  if (loose.length > 1) fail(`"${query}" matches ${loose.map((e) => e.id).join(', ')}. Use the full id.`)
  fail(`Nothing called "${query}". Run  node nithya.mjs list  to see every id.`)
}

function table(rows) {
  const widths = rows[0].map((_, c) => Math.max(...rows.map((r) => r[c].length)))
  return rows.map((r) => '  ' + r.map((cell, c) => (c === r.length - 1 ? cell : cell.padEnd(widths[c]))).join('   ')).join('\n')
}

const runtimeLabels = (kit) => Object.values(kit.runtimes).map((r) => r.label).join(', ')

function rowsFor(category) {
  return items(category).map((e) => {
    if (category === 'kits') return [e.id, runtimeLabels(e), e.summary]
    if (category === 'themes') return [e.id, e.modes + (e.isDefault ? ', default' : ''), e.summary]
    if (category === 'patterns') return [e.id, e.kits.join(', '), e.summary]
    return [e.id, e.summary]
  })
}

function list(category) {
  const chosen = category ? [category] : categories
  for (const c of chosen) if (!categories.includes(c)) fail(`No category "${c}". Choose one of: ${categories.join(', ')}.`)
  const out = []
  for (const c of chosen) {
    const rows = rowsFor(c)
    out.push(`${c.toUpperCase()} (${rows.length}): ${catalog.categories[c]}`)
    out.push(table(rows), '')
  }
  if (!category) out.push('Next: node nithya.mjs show <id>   or   node nithya.mjs pick <kit> <dest> --themes a,b')
  return out.join('\n')
}

function show(query) {
  const e = find(query)
  const out = [`${e.name}  (${e.category.replace(/s$/, '')} ${e.id})`, '', e.summary]
  if (e.category === 'kits') {
    const kitThemes = themes().filter((t) => t.kit === e.id)
    out.push(
      '',
      `Best for:   ${e.bestFor}`,
      `Origin:     ${e.origin}`,
      `Runtimes:   ${Object.entries(e.runtimes).map(([id, r]) => `${id} (${r.label})`).join(', ')}`,
      `Themes:     ${kitThemes.map((t) => t.id.split('/')[1]).join(', ')}  (first is the default)`,
      `Components: ${catalog.components.filter((c) => c.kit === e.id).map((c) => c.name).join(', ')}`,
      `Patterns:   ${catalog.patterns.filter((p) => p.kits.includes(e.id)).map((p) => p.id).join(', ')}`,
      `Folder:     ${e.path}`,
      '',
      `Pick it:    node nithya.mjs pick ${e.id} <dest>${Object.keys(e.runtimes).length > 1 ? ` --runtime ${Object.keys(e.runtimes).join('|')}` : ''} --themes ${kitThemes.map((t) => t.id.split('/')[1]).join(',')}`,
    )
  } else if (e.category === 'themes') {
    out.push('', `Kit:   ${e.kit}`, `Modes: ${e.modes}`, '', `Pick it: node nithya.mjs pick ${e.kit} <dest> --themes ${e.id.split('/')[1]}`)
  } else if (e.category === 'components') {
    const kit = catalog.kits.find((k) => k.id === e.kit)
    out.push('', `Kit:   ${e.kit} (comes with the kit; parts depend on each other)`, `Files: ${e.files.map((f) => path.join(kit.path, f)).join(', ')}`)
  } else {
    out.push('', `Kits: ${e.kits.join(', ')}`, '', '-'.repeat(60), '', fs.readFileSync(path.join(root, e.doc), 'utf8').trim())
  }
  return out.join('\n')
}

function parsePick(args) {
  const opts = { positional: [] }
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--runtime' || args[i] === '--themes') opts[args[i].slice(2)] = args[++i] ?? fail(`${args[i]} needs a value.`)
    else if (args[i].startsWith('--')) fail(`Unknown option ${args[i]}.`)
    else opts.positional.push(args[i])
  }
  return opts
}

/** Merges `patch` into `obj`; a null value removes the key. */
function merge(obj, patch) {
  for (const [k, v] of Object.entries(patch)) {
    if (v === null) delete obj[k]
    else if (typeof v === 'object' && !Array.isArray(v)) obj[k] = merge(obj[k] ?? {}, v)
    else obj[k] = v
  }
  return obj
}

function sourceCommit() {
  try {
    return execFileSync('git', ['-C', root, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return 'unknown'
  }
}

function pick(args) {
  const opts = parsePick(args)
  const [kitId, destArg] = opts.positional
  if (!kitId || !destArg || opts.positional.length > 2) fail('Usage: node nithya.mjs pick <kit> <dest> [--runtime <name>] [--themes a,b]')
  const kit = catalog.kits.find((k) => k.id === kitId) ?? fail(`No kit "${kitId}". Kits: ${catalog.kits.map((k) => k.id).join(', ')}.`)
  const runtimeIds = Object.keys(kit.runtimes)
  const runtimeId = opts.runtime ?? (runtimeIds.length === 1 ? runtimeIds[0] : fail(`Kit "${kit.id}" has more than one runtime. Add --runtime ${runtimeIds.join(' or --runtime ')}.`))
  const runtime = kit.runtimes[runtimeId] ?? fail(`Kit "${kit.id}" has no runtime "${runtimeId}". Choose: ${runtimeIds.join(', ')}.`)

  const available = Object.keys(kitTokens(kit).themes)
  const chosen = opts.themes ? opts.themes.split(',').map((s) => s.trim()).filter(Boolean) : available
  const unknown = chosen.filter((t) => !available.includes(t))
  if (unknown.length) fail(`Kit "${kit.id}" has no theme ${unknown.join(', ')}. Themes: ${available.join(', ')}.`)
  if (!chosen.length) fail('--themes needs at least one theme.')

  // Never write into a folder that already holds something.
  const dest = path.resolve(destArg)
  if (fs.existsSync(dest) && fs.readdirSync(dest).length) fail(`${dest} is not empty. Pick into a new or empty folder.`)

  const src = path.join(root, kit.path)
  const excluded = new Set((runtime.exclude ?? []).map((p) => path.join(src, p)))
  for (const rel of runtime.files) {
    fs.cpSync(path.join(src, rel), path.join(dest, rel), {
      recursive: true,
      filter: (from) => !SKIP.has(path.basename(from)) && !excluded.has(from),
    })
  }
  fs.copyFileSync(path.join(root, 'LICENSE'), path.join(dest, 'LICENSE'))

  if (runtime.package) {
    const file = path.join(dest, 'package.json')
    fs.writeFileSync(file, JSON.stringify(merge(readJson(file), runtime.package), null, 2) + '\n')
  }

  // Keep only the chosen themes, in the chosen order, then regenerate the kit's styles.
  const tokensFile = path.join(dest, kit.tokens)
  const tokens = readJson(tokensFile)
  tokens.themes = Object.fromEntries(chosen.map((id) => [id, tokens.themes[id]]))
  fs.writeFileSync(tokensFile, JSON.stringify(tokens, null, 2) + '\n')
  execFileSync(process.execPath, [kit.build], { cwd: dest, stdio: ['ignore', 'ignore', 'inherit'] })

  const next = runtime.next.map((s) => s.replaceAll('<dest>', destArg).replaceAll('<first theme>', chosen[0]))
  const commit = sourceCommit()
  fs.writeFileSync(
    path.join(dest, 'NITHYA.md'),
    [
      `# Picked from Nithya`,
      '',
      `- Kit: ${kit.name} (\`${kit.id}\`), runtime ${runtime.label}`,
      `- Themes: ${chosen.join(', ')} (default: ${chosen[0]})`,
      `- Source: github.com/sudharamachandranrajeev/nithya at \`${commit}\`, ${new Date().toISOString().slice(0, 10)}`,
      `- Licence: Apache-2.0 (see LICENSE)`,
      '',
      'This folder is a copy. Change it freely; to take later Nithya changes, pick again into a',
      'new folder and compare.',
      '',
      '## Next steps',
      '',
      ...next.map((s, i) => `${i + 1}. ${s}`),
      '',
    ].join('\n'),
  )

  return [
    `Copied ${kit.name} (${runtime.label}) to ${dest}`,
    `Themes: ${chosen.join(', ')} (default ${chosen[0]})`,
    '',
    'Next:',
    ...next.map((s, i) => `  ${i + 1}. ${s}`),
  ].join('\n')
}

const help = `Nithya catalogue

  node nithya.mjs                     everything, by category
  node nithya.mjs list <category>     ${categories.join(' | ')}
  node nithya.mjs show <id>           details, e.g. calm, calm/aurora, studio/button, calm-motion
  node nithya.mjs pick <kit> <dest> [--runtime <name>] [--themes a,b]
                                      copy a kit into a new folder; the first theme is the default`

export function run(argv) {
  const [cmd, ...rest] = argv
  if (!cmd) return list()
  if (cmd === 'list') return list(rest[0])
  if (cmd === 'show') return rest[0] ? show(rest[0]) : fail('Usage: node nithya.mjs show <id>')
  if (cmd === 'pick') return pick(rest)
  if (cmd === 'help' || cmd === '--help' || cmd === '-h') return help
  fail(`Unknown command "${cmd}".\n\n${help}`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    console.log(run(process.argv.slice(2)))
  } catch (e) {
    if (!(e instanceof Refusal)) throw e
    console.error(e.message)
    process.exit(1)
  }
}
