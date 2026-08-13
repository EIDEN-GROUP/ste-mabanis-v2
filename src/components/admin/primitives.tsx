import { useEffect, type ReactNode } from "react";
import { X, Inbox, TrendingUp, TrendingDown } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { formatPercent } from "@/lib/admin/format";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------- Panel */

/** The base surface every admin block sits on. Square, hairline, no shadow noise. */
export function Panel({
  children,
  className,
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string | undefined;
  as?: "section" | "div" | "article" | undefined;
}) {
  return <Tag className={cn("border border-line bg-admin-surface", className)}>{children}</Tag>;
}

export function PanelHeader({
  title,
  eyebrow,
  action,
  className,
}: {
  title: string;
  eyebrow?: string | undefined;
  action?: ReactNode | undefined;
  className?: string | undefined;
}) {
  return (
    <div className={cn("flex items-start gap-4 border-b border-line px-5 py-4", className)}>
      <div className="min-w-0 flex-1">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="display mt-1 truncate text-xl">{title}</h2>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* ---------------------------------------------------------------- StatCard */

export function StatCard({
  label,
  value,
  delta,
  hint,
  icon: Icon,
  index = 0,
  className,
}: {
  label: string;
  value: string;
  delta?: number | undefined;
  hint?: string | undefined;
  icon?: React.ComponentType<{ className?: string }> | undefined;
  index?: number | undefined;
  className?: string | undefined;
}) {
  const positive = (delta ?? 0) >= 0;
  const Trend = positive ? TrendingUp : TrendingDown;

  return (
    <Panel
      className={cn(
        "stagger-in group relative overflow-hidden p-5 transition-[border-color,box-shadow] duration-400 hover:border-gold/60 hover:shadow-panel",
        className,
      )}
      as="article"
    >
      <div className="flex items-start gap-3" style={{ ["--i" as string]: index }}>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.62rem] tracking-[0.2em] text-muted-foreground uppercase">
            {label}
          </p>
          <p className="display mt-3 text-[clamp(1.75rem,4vw,2.5rem)] tabular-nums">{value}</p>
        </div>
        {Icon ? (
          <span className="grid size-10 shrink-0 place-items-center border border-line bg-sand text-gold transition-colors duration-400 group-hover:border-gold/50">
            <Icon className="size-4" />
          </span>
        ) : null}
      </div>

      {delta !== undefined || hint ? (
        <div className="mt-4 flex items-center gap-2 border-t border-line pt-3 text-xs">
          {delta !== undefined ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 font-medium tabular-nums",
                positive ? "text-positive" : "text-negative",
              )}
            >
              <Trend className="size-3.5" />
              {formatPercent(delta)}
            </span>
          ) : null}
          {hint ? <span className="truncate text-muted-foreground">{hint}</span> : null}
        </div>
      ) : null}
    </Panel>
  );
}

/* -------------------------------------------------------------- EmptyState */

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
  className,
}: {
  title: string;
  description?: string | undefined;
  action?: ReactNode | undefined;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string | undefined;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-14 text-center", className)}>
      <span className="grid size-14 place-items-center border border-line bg-sand text-gold">
        <Icon className="size-6" />
      </span>
      <h3 className="display mt-5 text-2xl">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------ LoadingState */

export function LoadingState({
  rows = 5,
  className,
  variant = "list",
}: {
  rows?: number | undefined;
  className?: string | undefined;
  variant?: "list" | "cards" | "chart" | undefined;
}) {
  if (variant === "chart") {
    return <div className={cn("skeleton h-64 w-full", className)} aria-hidden />;
  }
  if (variant === "cards") {
    return (
      <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3", className)} aria-hidden>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="skeleton h-52 w-full" />
        ))}
      </div>
    );
  }
  return (
    <div className={cn("space-y-2", className)} aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton h-14 w-full" />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------- Modal */

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string | undefined;
  children: ReactNode;
  footer?: ReactNode | undefined;
  size?: "sm" | "md" | "lg" | undefined;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const widths = { sm: "max-w-md", md: "max-w-2xl", lg: "max-w-4xl" };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6",
        open ? "visible" : "pointer-events-none invisible",
      )}
      style={{ transition: `visibility 0s linear ${open ? 0 : 320}ms` }}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        aria-hidden
        className={cn(
          "absolute inset-0 bg-navy/45 backdrop-blur-[2px] transition-opacity duration-320",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative flex max-h-[92vh] w-full flex-col bg-admin-surface shadow-elegant transition-[opacity,transform] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
          widths[size],
          // Sheet from the bottom on phones, scale-in on larger screens.
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-6 scale-100 opacity-0 sm:translate-y-0 sm:scale-[0.98]",
        )}
      >
        <header className="flex items-start gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 className="display text-2xl">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="grid size-9 shrink-0 place-items-center border border-line text-navy transition-colors hover:border-gold"
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer ? (
          <footer className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-line px-5 py-4">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Drawer */

/** Side sheet on desktop, bottom sheet on phones — used for filters and detail. */
export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  side = "right",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode | undefined;
  side?: "right" | "left" | undefined;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        className={cn(
          "fixed inset-0 z-[95] bg-navy/45 backdrop-blur-[2px] transition-opacity duration-400",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        aria-hidden={!open}
        className={cn(
          "fixed z-[96] flex flex-col bg-admin-surface shadow-elegant transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] motion-reduce:transition-none",
          // Bottom sheet under sm, side sheet from sm up.
          "inset-x-0 bottom-0 max-h-[85vh] rounded-t-lg sm:inset-y-0 sm:max-h-none sm:w-full sm:max-w-[24rem] sm:rounded-none",
          side === "right" ? "sm:right-0 sm:left-auto" : "sm:left-0 sm:right-auto",
          open
            ? "translate-y-0 sm:translate-x-0"
            : side === "right"
              ? "translate-y-full sm:translate-y-0 sm:translate-x-full"
              : "translate-y-full sm:translate-y-0 sm:-translate-x-full",
        )}
      >
        <header className="flex shrink-0 items-center gap-3 border-b border-line px-5 py-4">
          <h2 className="display min-w-0 flex-1 truncate text-xl">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="grid size-9 shrink-0 place-items-center border border-line text-navy transition-colors hover:border-gold"
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer ? (
          <footer className="flex shrink-0 gap-3 border-t border-line px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {footer}
          </footer>
        ) : null}
      </aside>
    </>
  );
}

/* ------------------------------------------------------------------ Toast */

/** Thin wrapper so screens never import sonner directly. */
export const toast = {
  success: (message: string, description?: string) =>
    sonnerToast.success(message, description ? { description } : undefined),
  error: (message: string, description?: string) =>
    sonnerToast.error(message, description ? { description } : undefined),
  info: (message: string, description?: string) =>
    sonnerToast(message, description ? { description } : undefined),
};

/* ----------------------------------------------------------------- Buttons */

export function AdminButton({
  children,
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline" | "danger" | undefined;
}) {
  const styles = {
    primary: "bg-gold text-navy hover:bg-navy hover:text-white",
    outline: "border border-line text-navy hover:border-gold",
    ghost: "text-muted-foreground hover:text-navy",
    danger: "border border-negative/40 text-negative hover:bg-negative hover:text-white",
  };
  return (
    <button
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 px-4 py-2.5 text-[0.68rem] tracking-[0.14em] uppercase transition-colors duration-300",
        styles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
