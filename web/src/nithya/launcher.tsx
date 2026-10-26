import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import type { HueName } from './tokens';

export type BadgeKind = 'new' | 'beta' | 'soon';

const hueVar = (prop: string, hue: string) => ({ [prop]: `var(--n-hue-${hue})` }) as CSSProperties;

export function Badge({ kind }: { kind: BadgeKind }) {
  return (
    <span className="n-badge" style={{ ['--n-badge-hue' as string]: `var(--n-badge-${kind})` }}>
      {kind.toUpperCase()}
    </span>
  );
}

/** Centered headline with one word picked out in the primary colour. */
export function Hero({
  title,
  accent,
  subtitle,
  compact,
}: {
  title: string;
  /** A word inside `title` to colour. */
  accent?: string;
  subtitle?: string;
  compact?: boolean;
}) {
  const at = accent ? title.indexOf(accent) : -1;
  return (
    <div>
      <h1 className={compact ? 'n-hero n-hero--compact' : 'n-hero'}>
        {at < 0 ? (
          title
        ) : (
          <>
            {title.slice(0, at)}
            <span className="n-hero__accent">{accent}</span>
            {title.slice(at + accent!.length)}
          </>
        )}
      </h1>
      {subtitle && <p className="n-hero__sub">{subtitle}</p>}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <h2 className="n-section-label">{children}</h2>;
}

/** Hue-tinted rounded square that carries a tool icon. */
export function IconTile({ icon: Icon, hue }: { icon: LucideIcon; hue: HueName }) {
  return (
    <span className="n-icon-tile" style={hueVar('--n-tile-hue', hue)} aria-hidden>
      <Icon size={22} />
    </span>
  );
}

export interface ToolCardProps {
  icon: LucideIcon;
  hue: HueName;
  title: string;
  description: string;
  badge?: BadgeKind;
  onClick?: () => void;
}

/** Launcher entry. A SOON card, or one with no handler, is disabled. */
export function ToolCard({ icon, hue, title, description, badge, onClick }: ToolCardProps) {
  const enabled = badge !== 'soon' && onClick != null;
  return (
    <button type="button" className="n-tool-card" disabled={!enabled} onClick={onClick}>
      <IconTile icon={icon} hue={hue} />
      <span className="n-tool-card__text">
        <span className="n-tool-card__title">
          <span className="n-heading">{title}</span>
          {badge && <Badge kind={badge} />}
        </span>
        <span className="n-tool-card__desc" style={{ display: 'block' }}>
          {description}
        </span>
      </span>
      {enabled && <ChevronRight className="n-tool-card__arrow" size={18} aria-hidden />}
    </button>
  );
}

/** Responsive card grid: as many 300px+ columns as fit. */
export function ToolGrid({ children }: { children: ReactNode }) {
  return <div className="n-tool-grid">{children}</div>;
}
