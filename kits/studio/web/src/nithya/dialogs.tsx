import type { LucideIcon } from 'lucide-react';
import { X } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { IconButton } from './buttons';

/**
 * Modal on the palette scrim. Escape and a scrim click close it, focus moves
 * in on open and returns to the opener on close.
 */
export function Dialog({
  open,
  onClose,
  title,
  actions,
  width = 560,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  actions?: ReactNode;
  width?: number;
  children: ReactNode;
}) {
  return (
    <Modal open={open} onClose={onClose} label={title}>
      <div className="n-dialog" style={{ width }}>
        {title && (
          <div className="n-dialog__head">
            <h2 className="n-title">{title}</h2>
            <IconButton icon={X} label="Close" size={32} onClick={onClose} />
          </div>
        )}
        <div className="n-dialog__body">{children}</div>
        {actions && <div className="n-dialog__actions">{actions}</div>}
      </div>
    </Modal>
  );
}

function Modal({
  open,
  onClose,
  label,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>('button, [href], input, textarea, [tabindex]')?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      opener?.focus();
    };
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="n-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={label}>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export interface Section {
  icon: LucideIcon;
  label: string;
  render: () => ReactNode;
}

/** Settings-style dialog: section list on the left, the picked section on the right. */
export function SectionedDialog({
  open,
  onClose,
  title,
  sections,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  sections: readonly Section[];
}) {
  const [index, setIndex] = useState(0);
  const current = sections[index];
  return (
    <Modal open={open} onClose={onClose} label={title}>
      <div className="n-dialog n-sectioned">
        <nav className="n-sectioned__nav" aria-label={title}>
          <h2 className="n-heading">{title}</h2>
          {sections.map(({ icon: Icon, label }, i) => (
            <button
              key={label}
              type="button"
              className="n-nav-item"
              aria-current={i === index}
              onClick={() => setIndex(i)}
            >
              <Icon size={18} aria-hidden />
              <span className="n-label">{label}</span>
            </button>
          ))}
        </nav>
        <div className="n-sectioned__main">
          <div className="n-sectioned__head">
            <h3 className="n-heading">{current.label}</h3>
            <IconButton icon={X} label="Close" size={32} onClick={onClose} />
          </div>
          <div className="n-sectioned__body">{current.render()}</div>
        </div>
      </div>
    </Modal>
  );
}

/** Labelled switch with a one-line explanation. */
export function SwitchRow({
  title,
  description,
  value,
  onChange,
}: {
  title: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="n-switch-row">
      <div className="n-label" id={id}>
        {title}
      </div>
      {description && <p>{description}</p>}
      <button
        type="button"
        role="switch"
        className="n-switch"
        aria-checked={value}
        aria-labelledby={id}
        onClick={() => onChange(!value)}
      />
    </div>
  );
}
