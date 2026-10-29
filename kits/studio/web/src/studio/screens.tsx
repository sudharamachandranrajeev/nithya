import {
  Box,
  Camera,
  Clapperboard,
  Crop,
  File,
  Globe,
  Grid3x3,
  Image,
  Images,
  Keyboard,
  LayoutDashboard,
  ListTree,
  Maximize2,
  Move,
  Music,
  Pencil,
  PenTool,
  Play,
  Plus,
  RotateCw,
  Sparkles,
  Sun,
  Upload,
  User,
  Wand2,
  Eye,
  Droplet,
} from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  Button,
  Chip,
  Dialog,
  DropZone,
  Hero,
  IconButton,
  Panel,
  PromptDock,
  ReferenceSlot,
  SectionLabel,
  Segmented,
  SelectTile,
  ToolCard,
  ToolGrid,
  Toolbar,
  ToolbarDivider,
  type ThemeName,
} from '../nithya';

export function LauncherScreen({ onOpen }: { onOpen: (mode: number) => void }) {
  return (
    <div style={{ height: '100%', overflow: 'auto', padding: 'var(--n-space-huge) var(--n-space-xl)' }}>
      <div style={{ maxWidth: 1104, margin: '0 auto' }}>
        <Hero title="What will you make today?" accent="make" subtitle="Pick a tool and start creating." />
        <div style={{ height: 'var(--n-space-xxl)' }} />
        <SectionLabel>Create</SectionLabel>
        <ToolGrid>
          <ToolCard icon={Image} hue="blue" title="Image" description="Generate images from a prompt" onClick={() => onOpen(1)} />
          <ToolCard icon={Clapperboard} hue="amber" title="Video" description="Animate stills into clips" onClick={() => onOpen(2)} />
          <ToolCard icon={Music} hue="rose" title="Audio" description="Music and sound effects" onClick={() => onOpen(3)} />
          <ToolCard icon={Box} hue="green" title="Stage" description="Block scenes and cameras in 3D" onClick={() => onOpen(5)} />
          <ToolCard icon={Globe} hue="sky" title="Worlds" description="Turn a reference into an environment" badge="new" onClick={() => {}} />
          <ToolCard icon={LayoutDashboard} hue="slate" title="Boards" description="Collect references on a board" badge="beta" onClick={() => {}} />
        </ToolGrid>
        <SectionLabel>Edit</SectionLabel>
        <ToolGrid>
          <ToolCard icon={PenTool} hue="violet" title="Canvas" description="Layer, mask and paint" onClick={() => onOpen(4)} />
          <ToolCard icon={Wand2} hue="teal" title="Cut out" description="Remove backgrounds" onClick={() => {}} />
          <ToolCard icon={Droplet} hue="red" title="Clean up" description="Remove marks from footage" badge="soon" />
        </ToolGrid>
      </div>
    </div>
  );
}

export function GenerateScreen({
  kind,
  enterToSubmit,
  onSubmit,
}: {
  kind: string;
  enterToSubmit: boolean;
  onSubmit: (prompt: string) => void;
}) {
  const label = kind[0].toUpperCase() + kind.slice(1);
  return (
    <div style={{ height: '100%', display: 'grid', placeItems: 'center', position: 'relative' }}>
      <div style={{ paddingBottom: 120 }}>
        <Hero title={`Create ${label}`} subtitle="Add a prompt, then generate" />
      </div>
      <div style={{ position: 'absolute', left: 24, right: 24, bottom: 72, display: 'flex', justifyContent: 'center' }}>
        <PromptDock
          key={kind}
          placeholder={`Describe the ${kind} you want…`}
          enterToSubmit={enterToSubmit}
          leading={<ReferenceSlot />}
          options={
            <>
              <Chip label="Model" icon={Sparkles} />
              <Chip label="16:9" icon={Crop} />
              <Chip label="1K" icon={Image} />
            </>
          }
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}

const sizes: Record<string, [number, number][]> = {
  Square: [
    [512, 512],
    [1024, 1024],
    [1536, 1536],
  ],
  Landscape: [
    [1280, 720],
    [1920, 1080],
    [2560, 1440],
  ],
  Portrait: [
    [720, 1280],
    [1080, 1920],
  ],
};

export function CanvasScreen() {
  const [sizing, setSizing] = useState(false);
  return (
    <div style={{ height: '100%', padding: '96px 96px 120px' }}>
      <DropZone
        icon={Pencil}
        title="Edit an image"
        hint="Drop an image here, or pick one to start"
        actions={
          <>
            <Button label="Choose file" icon={Upload} large />
            <Button label="From library" icon={Images} large variant="secondary" />
            <Button label="Blank canvas" icon={Maximize2} large variant="secondary" onClick={() => setSizing(true)} />
          </>
        }
      />
      <CanvasSizeDialog open={sizing} onClose={() => setSizing(false)} />
    </div>
  );
}

export function CanvasSizeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [size, setSize] = useState<string>();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Canvas size"
      actions={
        <>
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          <Button label="Create" disabled={!size} onClick={onClose} />
        </>
      }
    >
      {Object.entries(sizes).map(([group, options]) => (
        <div key={group}>
          <div className="n-overline" style={{ margin: '8px 0' }}>
            {group}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {options.map(([w, h]) => {
              const label = `${w} × ${h}`;
              return (
                <SelectTile key={label} label={label} selected={size === label} onClick={() => setSize(label)}>
                  <span style={{ width: 64, height: 40, display: 'grid', placeItems: 'center' }}>
                    <span
                      style={{
                        width: 36 * Math.min(1.6, w / h),
                        height: 36 * Math.min(1, h / w),
                        borderRadius: 2,
                        background: 'var(--n-foreground)',
                      }}
                    />
                  </span>
                </SelectTile>
              );
            })}
          </div>
        </div>
      ))}
    </Dialog>
  );
}

/** Perspective floor grid that fades into the horizon. */
function StageGrid() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext?.('2d');
    if (!canvas || !ctx || typeof ResizeObserver === 'undefined') return;
    const paint = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * devicePixelRatio;
      canvas.height = height * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      const css = getComputedStyle(canvas);
      const line = css.getPropertyValue('--n-divider');
      const horizon = height * 0.28;
      ctx.strokeStyle = line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = -30; i <= 30; i++) {
        ctx.moveTo(width / 2, horizon);
        ctx.lineTo(width / 2 + (i * width) / 12, height * 1.6);
      }
      for (let d = 1; d < 40; d *= 1.18) {
        const y = horizon + (height - horizon) * (1 - 1 / d) * 1.4;
        if (y > height) break;
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
    };
    const observer = new ResizeObserver(paint);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);
  return (
    <>
      <canvas ref={ref} aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: '0 0 auto',
          height: 'calc(28% + 120px)',
          background: 'linear-gradient(var(--n-background), transparent)',
        }}
      />
    </>
  );
}

const at = (style: CSSProperties): CSSProperties => ({ position: 'absolute', ...style });

export function StageScreen() {
  const [mode, setMode] = useState<'build' | 'record'>('build');
  const [tool, setTool] = useState('move');
  const [outliner, setOutliner] = useState(true);
  const toolChip = (id: string, icon: typeof Move, label: string) => (
    <Chip label={label} icon={icon} selected={tool === id} onClick={() => setTool(id)} />
  );
  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
      <StageGrid />
      <div style={at({ top: 12, left: 12, display: 'flex', gap: 8 })}>
        <Chip label="File" icon={File} />
        <Chip label="Outliner" icon={ListTree} selected={outliner} onClick={() => setOutliner(!outliner)} />
        <Chip label="Shortcuts" icon={Keyboard} />
      </div>
      <div style={at({ top: 12, left: '50%', transform: 'translateX(-50%)', display: 'grid', justifyItems: 'center', gap: 12 })}>
        <Segmented
          label="Stage mode"
          options={[
            { value: 'build', label: 'Build' },
            { value: 'record', label: 'Record' },
          ]}
          value={mode}
          onChange={setMode}
        />
        <Toolbar label="Stage tools">
          <IconButton icon={Plus} label="Add object" filled />
          <IconButton icon={Grid3x3} label="Snap" />
          <ToolbarDivider />
          {toolChip('move', Move, 'Move')}
          {toolChip('rotate', RotateCw, 'Rotate')}
          {toolChip('scale', Maximize2, 'Scale')}
          <ToolbarDivider />
          <Chip label="World" icon={Globe} />
        </Toolbar>
      </div>
      {outliner && (
        <Panel
          title="Scene"
          onClose={() => setOutliner(false)}
          actions={<IconButton icon={Plus} label="Add to scene" size={30} />}
          style={at({ left: 12, top: 120, width: 'var(--n-size-outliner)' })}
        >
          {(
            [
              [Camera, 'Camera', 'Camera'],
              [Sun, 'Key light', 'Light'],
              [User, 'Mannequin', 'Character'],
            ] as const
          ).map(([Icon, name, kind]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
              <Icon size={20} aria-hidden />
              <div style={{ flex: 1 }}>
                <div className="n-label">{name}</div>
                <div className="n-muted" style={{ fontSize: 'var(--n-type-caption-size)' }}>
                  {kind}
                </div>
              </div>
              <IconButton icon={Eye} label={`Hide ${name}`} size={28} />
            </div>
          ))}
        </Panel>
      )}
      <Panel
        style={at({
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 720,
          maxWidth: 'calc(100% - 32px)',
          padding: '4px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        })}
      >
        <IconButton icon={Play} label="Play" />
        <span className="n-muted">0:00</span>
        <input className="n-range" type="range" aria-label="Timeline" defaultValue={20} />
        <span className="n-muted">0:10</span>
      </Panel>
    </div>
  );
}

/** Small preview of a palette. Theme variables cascade, so the attribute scopes it. */
export function ThemeSwatch({ theme }: { theme: ThemeName }) {
  const block = (style: CSSProperties) => <span style={at({ borderRadius: 4, ...style })} />;
  return (
    <span
      data-nithya-theme={theme}
      style={{
        position: 'relative',
        display: 'block',
        width: 96,
        height: 56,
        overflow: 'hidden',
        borderRadius: 'var(--n-radius-md)',
        border: '1px solid var(--n-panel-border)',
        background: 'var(--n-backdrop)',
      }}
    >
      {block({ left: 8, top: 8, right: 30, height: 14, background: 'var(--n-panel)' })}
      {block({ left: 8, bottom: 8, width: 28, height: 12, borderRadius: 6, background: 'var(--n-primary)' })}
      {block({ left: 40, bottom: 8, width: 28, height: 12, borderRadius: 6, background: 'var(--n-controls)' })}
    </span>
  );
}
