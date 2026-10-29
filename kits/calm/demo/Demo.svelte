<script lang="ts">
  // Every Calm part on two pages, filled with made-up content.
  import LayoutGrid from '@lucide/svelte/icons/layout-grid'
  import Palette from '@lucide/svelte/icons/palette'
  import { Button, Card, Pill, Row, Segmented, Shell, Stat, ThemeEditor, ThemePicker, ui, type NavItem } from '../src/index.ts'

  const items: NavItem[] = [
    { id: 'parts', label: 'Parts', icon: LayoutGrid },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ]
  const fromHash = () => location.hash.replace(/^#\/?/, '').split('?')[0] || 'parts'
  let page = $state(fromHash())
  addEventListener('hashchange', () => (page = fromHash()))

  let range = $state<'week' | 'month' | 'year'>('week')
  const ranges: { value: typeof range; label: string }[] = [
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
  ]
</script>

<Shell brand="Nithya Calm" {items} current={page} onnavigate={(id) => (location.hash = `/${id}`)}>
  {#snippet footer()}Demo content only<br />Theme: {ui.current.label}{ui.calm ? ' · calm' : ''}{/snippet}
  {#key page}
    <div class="page">
      {#if page === 'parts'}
        <h1>Good evening</h1>
        <p class="lead">Every part on this page reads the current theme. Change it under Appearance and all of it follows.</p>
        <div class="grid">
          <Card title="Today" explain="Rows with a time, a title, a note and a status pill. Tap a pill to act on it.">
            <div class="list">
              <Row lead="07:30" title="Morning walk" sub="20 minutes">{#snippet trailing()}<Pill tone="done">Done</Pill>{/snippet}</Row>
              <Row lead="12:00" title="Lunch with Sam" sub="Corner café">{#snippet trailing()}<Pill tone="ok">Booked</Pill>{/snippet}</Row>
              <Row lead="18:30" title="Read a chapter" sub="Before dinner">{#snippet trailing()}<Pill onclick={() => {}}>Start</Pill>{/snippet}</Row>
              <Row lead="Sun" title="Plants need water" sub="Kitchen and balcony">{#snippet trailing()}<Pill tone="danger">Due</Pill>{/snippet}</Row>
            </div>
          </Card>

          <Card title="This week" explain="A number, its unit, a short note and a small trend line. The shaded band is the usual range.">
            <div class="range"><Segmented label="Time range" options={ranges} value={range} onchange={(r) => (range = r)} /></div>
            <div class="stats">
              <Stat label="Steps" value="8,420" note="↑ 9%" tone="ok" trend={[6100, 7300, 7700, 8420]} range={[7000, 10000]} explain="Average steps a day. The band shows 7,000 to 10,000." />
              <Stat label="Sleep" value="6.2" unit="h" note="below aim" tone="warn" trend={[7.1, 6.4, 6.8, 6.2]} explain="Average hours asleep a night." />
              <Stat label="Focus" value="3.5" unit="h" note="steady" tone="ok" trend={[3.2, 3.6, 3.4, 3.5]} explain="Hours of uninterrupted work a day." />
              <Stat label="Screen" value="4.1" unit="h" note="↑ 0.6" tone="danger" trend={[3.2, 3.5, 3.9, 4.1]} explain="Hours on the phone a day." />
            </div>
          </Card>

          <Card title="Buttons and pills" explain="Three button styles and five pill tones. Every theme keeps their text readable.">
            <div class="row"><Button>Main action</Button><Button variant="quiet">Second</Button><Button variant="ghost">Cancel</Button></div>
            <div class="row"><Pill>Accent</Pill><Pill tone="ok">Good</Pill><Pill tone="warn">Worth a look</Pill><Pill tone="danger">Needs attention</Pill><Pill tone="done">Done</Pill></div>
          </Card>
        </div>
      {:else}
        <h1>Appearance</h1>
        <p class="lead">One choice changes every screen. Make your own theme below; it is checked so text stays easy to read.</p>
        <Card title="Theme" explain="Pick a look for the whole app. Light or dark and motion apply to every theme.">
          <ThemePicker />
        </Card>
        <div class="gap"></div>
        <Card title="Make your own" explain="Start from any theme, change colours, fonts and shapes, and see the result live before saving.">
          <ThemeEditor />
        </Card>
      {/if}
    </div>
  {/key}
</Shell>

<style>
  .page { animation: enter var(--dur-slow) var(--ease); }
  @keyframes enter { from { opacity: 0; translate: 0 8px; } }
  h1 { font-size: var(--text-display); font-weight: var(--weight-display); }
  .lead { color: var(--c-muted); margin: 4px 0 20px; max-width: 70ch; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 18px; }
  .list { display: flex; flex-direction: column; gap: 8px; }
  .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .range { margin-bottom: 12px; }
  .row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
  .gap { height: 18px; }
</style>
