import { test } from 'node:test'
import assert from 'node:assert/strict'
import { tokens } from '../src/generated/tokens.ts'
import { check, ratio } from '../src/contrast.ts'
import { colourNames, themeVars } from '../src/compile.ts'
import { validateTheme } from '../src/presets.ts'

test('contrast ratio matches WCAG reference values', () => {
  assert.equal(Math.round(ratio('#000000', '#ffffff') * 100) / 100, 21)
  assert.equal(ratio('#777777', '#777777'), 1)
  assert.ok(Math.abs(ratio('#767676', '#ffffff') - 4.54) < 0.01)
})

test('every built-in theme has light and dark colours that pass every contrast pair', () => {
  for (const [id, t] of Object.entries(tokens.themes)) {
    for (const mode of ['light', 'dark'] as const) {
      const c = t.modes[mode]
      assert.ok(c, `${id} lacks ${mode}`)
      for (const n of colourNames) assert.match(c[n], /^#[0-9a-f]{6}$/i, `${id}/${mode}.${n}`)
      assert.deepEqual(check(c, tokens.contrast.pairs), [], `${id}/${mode}`)
    }
  }
})

test('theme variables resolve colour references and leave no braces behind', () => {
  for (const t of Object.values(tokens.themes)) {
    const v = themeVars(tokens.fonts, t, 'light')
    for (const [k, val] of Object.entries(v)) assert.ok(!val.includes('{'), `${k} = ${val}`)
    assert.match(v['--card-border'], /^(0|1px solid var\(--c-line\))$/)
  }
})

// Theme-agnostic, so the tests still pass when an app keeps only some themes.
const themes = Object.values(tokens.themes)
const first = () => JSON.parse(JSON.stringify(themes[0]))

test('an exported built-in theme imports back unchanged', () => {
  const back = validateTheme(first())
  assert.equal(typeof back, 'object')
  assert.deepEqual(back, first())
})

test('imported themes cannot carry arbitrary CSS', () => {
  const evil = first()
  evil.style.cardShadow = 'none; } body { display: none'
  assert.equal(typeof validateTheme(evil), 'string')
  const badColour = first()
  badColour.modes.light.ink = 'red; background: url(https://example.com/x)'
  assert.equal(typeof validateTheme(badColour), 'string')
  const badFont = first()
  badFont.type.body = 'Comic Sans'
  assert.equal(typeof validateTheme(badFont), 'string')
})

test('style looks can be mixed across built-in themes', () => {
  const mix = first()
  for (const k of ['rowBg', 'rowRadius', 'rowDivider'] as const) mix.style[k] = themes.at(-1)!.style[k]
  assert.equal(typeof validateTheme(mix), 'object')
})
