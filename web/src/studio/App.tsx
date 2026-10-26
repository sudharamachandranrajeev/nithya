import {
  Box,
  Calculator,
  CircleHelp,
  Clapperboard,
  Gem,
  House,
  Image,
  Images,
  Info,
  ListChecks,
  Music,
  Palette,
  PenTool,
  Settings,
  Share,
  Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Button,
  Chip,
  IconButton,
  NithyaTheme,
  SectionedDialog,
  SelectTile,
  Shell,
  SwitchRow,
  themeLabels,
  themeNames,
  type Mode,
  type ThemeName,
} from '../nithya';
import { CanvasScreen, GenerateScreen, LauncherScreen, StageScreen, ThemeSwatch } from './screens';

const modes: Mode[] = [
  { icon: House, label: 'Home' },
  { icon: Image, label: 'Image' },
  { icon: Clapperboard, label: 'Video' },
  { icon: Music, label: 'Audio' },
  { icon: PenTool, label: 'Canvas' },
  { icon: Box, label: 'Stage' },
];

/** Demo studio: every screen is assembled from Nithya components only. */
export function App({ initialMode = 0, initialTheme = themeNames[0] }: { initialMode?: number; initialTheme?: ThemeName }) {
  const [theme, setTheme] = useState<ThemeName>(initialTheme);
  const [mode, setMode] = useState(initialMode);
  const [enterToSubmit, setEnterToSubmit] = useState(false);
  const [settings, setSettings] = useState(false);
  const [toast, setToast] = useState<string>();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(undefined), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const generate = (kind: string) => (
    <GenerateScreen kind={kind} enterToSubmit={enterToSubmit} onSubmit={setToast} />
  );
  const [title, body] =
    {
      1: ['Create Image', generate('image')],
      2: ['Create Video', generate('video')],
      3: ['Create Audio', generate('audio')],
      4: ['Canvas', <CanvasScreen />],
      5: ['Stage', <StageScreen />],
    }[mode] ?? ['Nithya Studio', <LauncherScreen onOpen={setMode} />];

  return (
    <NithyaTheme theme={theme}>
      <Shell
        modes={modes}
        selectedMode={mode}
        onModeSelected={setMode}
        title={
          <>
            <Sparkles size={18} color="var(--n-primary)" aria-hidden />
            {title}
          </>
        }
        actions={
          <>
            <span className="n-label n-muted">120 credits</span>
            <Button label="Upgrade" icon={Gem} />
            <IconButton icon={Share} label="Share" filled />
            <IconButton icon={Settings} label="Settings" filled onClick={() => setSettings(true)} />
            <Button label="Library" icon={Images} variant="secondary" />
            <IconButton icon={ListChecks} label="Tasks" filled />
          </>
        }
        cornerActions={
          mode === 0 ? undefined : (
            <>
              <Chip label="Costs" icon={Calculator} />
              <Chip label="Help" icon={CircleHelp} />
            </>
          )
        }
      >
        {body}
      </Shell>
      <SectionedDialog
        open={settings}
        onClose={() => setSettings(false)}
        title="Settings"
        sections={[
          {
            icon: Settings,
            label: 'General',
            render: () => (
              <SwitchRow
                title="Enter to generate"
                description="On: Enter sends the prompt and Shift+Enter adds a line. Off: only the button sends."
                value={enterToSubmit}
                onChange={setEnterToSubmit}
              />
            ),
          },
          {
            icon: Palette,
            label: 'Appearance',
            render: () => (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--n-space-md)' }}>
                {themeNames.map((name) => (
                  <SelectTile key={name} label={themeLabels[name]} selected={name === theme} onClick={() => setTheme(name)}>
                    <ThemeSwatch theme={name} />
                  </SelectTile>
                ))}
              </div>
            ),
          },
          {
            icon: Info,
            label: 'About',
            render: () => <p className="n-muted">Nithya Studio is a reference app for the Nithya design framework.</p>,
          },
        ]}
      />
      {toast && (
        <div className="n-toast" role="status">
          {toast}
        </div>
      )}
    </NithyaTheme>
  );
}
