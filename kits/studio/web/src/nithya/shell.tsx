import { isTauri } from '@tauri-apps/api/core';
import type { LucideIcon } from 'lucide-react';
import { Minus, Square, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { IconButton } from './buttons';

export interface Mode {
  icon: LucideIcon;
  label: string;
}

/** Pill of icon buttons that picks the studio's working mode. */
export function ModeSwitcher({
  modes,
  selected,
  onSelected,
}: {
  modes: readonly Mode[];
  selected: number;
  onSelected: (index: number) => void;
}) {
  return (
    <nav className="n-modes" aria-label="Modes">
      {modes.map((m, i) => (
        <IconButton
          key={m.label}
          icon={m.icon}
          label={m.label}
          selected={i === selected}
          aria-current={i === selected ? 'page' : undefined}
          size={32}
          onClick={() => onSelected(i)}
        />
      ))}
    </nav>
  );
}

/** Theme backdrop: flat colour or glow layers, optionally behind a tinted photo. */
export function Backdrop({ photo }: { photo?: string }) {
  return (
    <div className="n-backdrop" aria-hidden>
      {photo && (
        <>
          <img className="n-backdrop__photo" src={photo} alt="" />
          <div className="n-backdrop__tint" />
        </>
      )}
    </div>
  );
}

/** Custom window buttons for an undecorated Tauri window. */
function WindowControls() {
  const act = (f: 'minimize' | 'toggleMaximize' | 'close') => async () => {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    await getCurrentWindow()[f]();
  };
  return (
    <div className="n-window-controls">
      <IconButton icon={Minus} label="Minimise" size={32} onClick={act('minimize')} />
      <IconButton icon={Square} label="Maximise" size={32} onClick={act('toggleMaximize')} />
      <IconButton icon={X} label="Close window" size={32} onClick={act('close')} />
    </div>
  );
}

export interface ShellProps {
  modes: readonly Mode[];
  selectedMode: number;
  onModeSelected: (index: number) => void;
  title: ReactNode;
  actions?: ReactNode;
  cornerActions?: ReactNode;
  photo?: string;
  /** Draw window buttons. Defaults to true inside Tauri, false in a browser. */
  windowControls?: boolean;
  children: ReactNode;
}

/**
 * Studio frame: 56px top bar (modes | title | actions) over the body. Inside
 * Tauri the bar is the window drag region.
 */
export function Shell({
  modes,
  selectedMode,
  onModeSelected,
  title,
  actions,
  cornerActions,
  photo,
  windowControls = isTauri(),
  children,
}: ShellProps) {
  return (
    <div className="n-shell">
      <Backdrop photo={photo} />
      <header className="n-topbar" data-tauri-drag-region>
        <ModeSwitcher modes={modes} selected={selectedMode} onSelected={onModeSelected} />
        <div className="n-topbar__title" data-tauri-drag-region>
          {title}
        </div>
        <div className="n-topbar__actions">
          {actions}
          {windowControls && <WindowControls />}
        </div>
      </header>
      <main className="n-shell__body">
        {children}
        {cornerActions && <div className="n-shell__corner">{cornerActions}</div>}
      </main>
    </div>
  );
}
