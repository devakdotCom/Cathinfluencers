import {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

const joinClasses = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconOnly?: boolean;
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-lg shadow-orange-950/20 hover:brightness-105',
  secondary:
    'border border-slate-600/70 bg-slate-900/80 text-slate-100 hover:border-amber-400/60 hover:bg-slate-800',
  ghost: 'text-slate-200 hover:bg-slate-800/80 hover:text-white',
  danger:
    'border border-rose-500/40 bg-rose-950/40 text-rose-100 hover:bg-rose-900/55',
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-3 text-xs',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-5 text-sm',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      iconOnly = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      className={joinClasses(
        'vox-focus inline-flex items-center justify-center gap-2 rounded-xl font-bold tracking-wide transition duration-200 disabled:cursor-not-allowed disabled:opacity-55',
        buttonVariants[variant],
        buttonSizes[size],
        iconOnly && 'aspect-square px-0',
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <span
          className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  ),
);

Button.displayName = 'Button';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive = false, ...props }, ref) => (
    <div
      ref={ref}
      className={joinClasses(
        'vox-surface rounded-2xl border border-slate-700/60',
        interactive &&
          'transition duration-200 hover:-translate-y-0.5 hover:border-amber-400/40 hover:shadow-xl hover:shadow-black/20',
        className,
      )}
      {...props}
    />
  ),
);

Card.displayName = 'Card';

type BadgeTone = 'neutral' | 'gold' | 'success' | 'warning' | 'danger' | 'info';

const badgeTones: Record<BadgeTone, string> = {
  neutral: 'border-slate-600/70 bg-slate-800/80 text-slate-200',
  gold: 'border-amber-400/35 bg-amber-400/10 text-amber-200',
  success: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  warning: 'border-orange-400/30 bg-orange-400/10 text-orange-200',
  danger: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
  info: 'border-sky-400/30 bg-sky-400/10 text-sky-200',
};

export function Badge({
  className,
  tone = 'neutral',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={joinClasses(
        'inline-flex min-h-6 items-center rounded-full border px-2.5 py-0.5 text-[0.68rem] font-bold uppercase tracking-[0.12em]',
        badgeTones[tone],
        className,
      )}
      {...props}
    />
  );
}

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={joinClasses(
        'animate-pulse rounded-lg bg-slate-700/65',
        className,
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={joinClasses(
        'flex flex-col items-center px-5 py-10 text-center',
        className,
      )}
    >
      {icon && (
        <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-slate-800 text-amber-300">
          {icon}
        </span>
      )}
      <h3 className="font-serif text-xl font-bold text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}

