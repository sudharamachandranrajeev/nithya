import type { LucideIcon } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const cx = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(' ');

type NativeButton = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

export interface ButtonProps extends NativeButton {
  label: string;
  icon?: LucideIcon;
  variant?: ButtonVariant;
  pill?: boolean;
  large?: boolean;
  expand?: boolean;
}

/** Text button. Primary is the one call to action per surface. */
export function Button({ label, icon: Icon, variant = 'primary', pill, large, expand, className, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={cx(
        'n-button',
        `n-button--${variant}`,
        pill && 'n-button--pill',
        large && 'n-button--large',
        expand && 'n-button--expand',
        className,
      )}
      {...rest}
    >
      {Icon && <Icon size={large ? 18 : 16} aria-hidden />}
      {label}
    </button>
  );
}

export interface IconButtonProps extends NativeButton {
  icon: LucideIcon;
  /** Required: becomes the accessible name and the hover tooltip. */
  label: string;
  selected?: boolean;
  filled?: boolean;
  size?: number;
}

/**
 * Icon-only button. The observed studio left most of these unnamed; here the
 * name is part of the type, so an unlabelled icon button does not compile.
 */
export function IconButton({ icon: Icon, label, selected, filled, size, className, style, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={selected}
      className={cx(
        'n-icon-button',
        filled && 'n-icon-button--filled',
        selected && 'n-icon-button--selected',
        className,
      )}
      style={size ? { ...style, ['--n-icon-size' as string]: `${size}px` } : style}
      {...rest}
    >
      <Icon size={18} aria-hidden />
    </button>
  );
}

export interface ChipProps extends NativeButton {
  label: string;
  icon?: LucideIcon;
  selected?: boolean;
}

/** Small toggle or option pill, e.g. aspect ratio or model pickers. */
export function Chip({ label, icon: Icon, selected, className, ...rest }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cx('n-chip', selected && 'n-chip--selected', className)}
      {...rest}
    >
      {Icon && <Icon size={15} aria-hidden />}
      {label}
    </button>
  );
}

export { cx };
