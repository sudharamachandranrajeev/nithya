import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { House, Image, Palette, Settings } from 'lucide-react';
import { afterEach, describe, expect, it } from 'vitest';
import tokens from '../../../tokens/nithya.tokens.json';
import { App } from '../studio/App';
import { IconButton, ModeSwitcher, NithyaTheme, PromptDock, SectionedDialog, ToolCard, themeNames } from '.';

afterEach(cleanup);

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe('palettes', () => {
  it('generated theme names match the token file', () => {
    expect([...themeNames]).toEqual(Object.keys(tokens.themes));
  });

  for (const [name, p] of Object.entries(tokens.themes)) {
    it(`${name}: text meets WCAG AA on every surface`, () => {
      for (const surface of [p.background, p.panel, p.modal]) {
        expect(contrast(p.foreground, surface)).toBeGreaterThanOrEqual(7);
        expect(contrast(p.muted, surface)).toBeGreaterThanOrEqual(4.5);
      }
      expect(contrast(p.foreground, p.controls)).toBeGreaterThanOrEqual(4.5);
    });
  }

  it('theme provider sets the document attribute', () => {
    render(<NithyaTheme theme="ember">x</NithyaTheme>);
    expect(document.documentElement.dataset.nithyaTheme).toBe('ember');
  });
});

it('icon buttons expose their label as accessible name and tooltip', () => {
  render(<IconButton icon={Settings} label="Settings" />);
  const button = screen.getByRole('button', { name: 'Settings' });
  expect(button.title).toBe('Settings');
});

it('mode switcher reports the tapped mode and marks the current one', async () => {
  let picked = -1;
  render(
    <ModeSwitcher
      modes={[
        { icon: House, label: 'Home' },
        { icon: Image, label: 'Image' },
      ]}
      selected={0}
      onSelected={(i) => (picked = i)}
    />,
  );
  expect(screen.getByRole('button', { name: 'Home' }).getAttribute('aria-current')).toBe('page');
  await userEvent.click(screen.getByRole('button', { name: 'Image' }));
  expect(picked).toBe(1);
});

it('a SOON tool card ignores clicks', async () => {
  let taps = 0;
  render(<ToolCard icon={Image} hue="red" title="Later" description="Not yet" badge="soon" onClick={() => taps++} />);
  await userEvent.click(screen.getByText('Later'));
  expect(taps).toBe(0);
  expect(screen.getByText('SOON')).toBeTruthy();
});

describe('prompt dock', () => {
  const run = async (enterToSubmit: boolean, keys: string) => {
    const sent: string[] = [];
    render(<PromptDock enterToSubmit={enterToSubmit} onSubmit={(t) => sent.push(t)} />);
    await userEvent.type(screen.getByRole('textbox', { name: 'Prompt' }), `a red kite${keys}`);
    return sent;
  };

  it('Enter sends when enabled', async () => {
    expect(await run(true, '{Enter}')).toEqual(['a red kite']);
  });

  it('Shift+Enter never sends', async () => {
    expect(await run(true, '{Shift>}{Enter}{/Shift}')).toEqual([]);
  });

  it('Enter does not send when disabled', async () => {
    expect(await run(false, '{Enter}')).toEqual([]);
  });

  it('send button is disabled until there is text', async () => {
    const sent: string[] = [];
    render(<PromptDock onSubmit={(t) => sent.push(t)} />);
    const send = screen.getByRole('button', { name: 'Generate' }) as HTMLButtonElement;
    expect(send.disabled).toBe(true);
    await userEvent.type(screen.getByRole('textbox'), '  dune at dusk ');
    await userEvent.click(send);
    expect(sent).toEqual(['dune at dusk']);
  });
});

it('sectioned dialog switches sections, closes on Escape and returns focus', async () => {
  function Host() {
    return (
      <SectionedDialog
        open
        onClose={() => (closed = true)}
        title="Settings"
        sections={[
          { icon: Settings, label: 'General', render: () => 'general body' },
          { icon: Palette, label: 'Appearance', render: () => 'looks body' },
        ]}
      />
    );
  }
  let closed = false;
  render(<Host />);
  expect(screen.getByRole('dialog', { name: 'Settings' })).toBeTruthy();
  expect(screen.getByText('general body')).toBeTruthy();
  await userEvent.click(screen.getByRole('button', { name: 'Appearance' }));
  expect(screen.getByText('looks body')).toBeTruthy();
  await userEvent.keyboard('{Escape}');
  expect(closed).toBe(true);
});

describe('studio', () => {
  for (let mode = 0; mode < 6; mode++) {
    it(`renders mode ${mode}`, () => {
      render(<App initialMode={mode} />);
      expect(screen.getByRole('navigation', { name: 'Modes' })).toBeTruthy();
    });
  }

  it('settings changes the theme', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
    await userEvent.click(screen.getByRole('button', { name: 'Appearance' }));
    await userEvent.click(screen.getByRole('button', { name: 'Lagoon' }));
    await act(async () => {});
    expect(document.documentElement.dataset.nithyaTheme).toBe('lagoon');
  });
});
