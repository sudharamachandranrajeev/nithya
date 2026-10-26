import type { LucideIcon } from 'lucide-react';
import { X } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { IconButton, cx } from './buttons';

/** Floating raised surface with an optional title row. */
export function Panel({
  title,
  actions,
  onClose,
  className,
  style,
  children,
}: {
  title?: string;
  actions?: ReactNode;
  onClose?: () => void;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <section className={cx('n-panel', className)} style={style} aria-label={title}>
      {(title || actions || onClose) && (
        <div className="n-panel__head">
          {title && <h2 className="n-heading">{title}</h2>}
          {actions}
          {onClose && <IconButton icon={X} label="Close" size={28} onClick={onClose} />}
        </div>
      )}
      {children}
    </section>
  );
}

/** Horizontal tool strip, e.g. canvas or stage tools. */
export function Toolbar({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="n-toolbar" role="toolbar" aria-label={label}>
      {children}
    </div>
  );
}

export function ToolbarDivider() {
  return <span className="n-toolbar__divider" role="separator" aria-orientation="vertical" />;
}

/** Pill of mutually exclusive options. */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="n-segmented" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          className="n-segmented__item"
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function DashedBox({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx('n-dashed', className)}>{children}</div>;
}

/** Empty-state target: big icon, title, hint and the ways to start. */
export function DropZone({
  icon: Icon,
  title,
  hint,
  actions,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  actions?: ReactNode;
}) {
  return (
    <DashedBox className="n-drop-zone">
      <span className="n-drop-zone__icon" aria-hidden>
        <Icon size={48} color="var(--n-primary)" />
      </span>
      <h2 className="n-title">{title}</h2>
      {hint && <p className="n-drop-zone__hint">{hint}</p>}
      {actions && <div className="n-drop-zone__actions">{actions}</div>}
    </DashedBox>
  );
}

/** Selectable preview tile with a caption, e.g. themes or canvas sizes. */
export function SelectTile({
  label,
  selected,
  onClick,
  children,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button type="button" className="n-select-tile" aria-pressed={selected} onClick={onClick}>
      {children}
      <span>{label}</span>
    </button>
  );
}
