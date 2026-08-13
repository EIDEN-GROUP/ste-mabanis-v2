import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { X, UserPlus, CalendarClock, CheckSquare, Receipt, Info, CheckCheck } from "lucide-react";
import {
  notificationsQuery,
  useReadAllNotifications,
  useReadNotification,
} from "@/lib/admin/queries";
import type { NotificationKind } from "@/lib/admin/types";
import { relativeTime } from "@/lib/admin/format";
import { cn } from "@/lib/utils";

const ICONS: Record<NotificationKind, typeof Info> = {
  lead: UserPlus,
  appointment: CalendarClock,
  task: CheckSquare,
  transaction: Receipt,
  system: Info,
};

const TONES: Record<NotificationKind, string> = {
  lead: "text-temp-hot",
  appointment: "text-chart-3",
  task: "text-status-offer",
  transaction: "text-positive",
  system: "text-muted-foreground",
};

export function NotificationCenter({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data = [], isPending } = useQuery(notificationsQuery());
  const readOne = useReadNotification();
  const readAll = useReadAllNotifications();
  const unread = data.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        className={cn(
          "fixed inset-0 z-[80] bg-navy/40 backdrop-blur-[2px] transition-opacity duration-400",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Centre de notifications"
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 right-0 z-[90] flex w-full max-w-[26rem] flex-col bg-admin-surface shadow-elegant transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] motion-reduce:transition-none",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line px-5">
          <div className="min-w-0 flex-1">
            <p className="eyebrow">Notifications</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {unread > 0 ? `${unread} non lue${unread > 1 ? "s" : ""}` : "Tout est à jour"}
            </p>
          </div>
          {unread > 0 ? (
            <button
              type="button"
              onClick={() => readAll.mutate()}
              className="inline-flex min-h-11 items-center gap-1.5 px-1 text-[0.68rem] tracking-[0.12em] text-muted-foreground uppercase transition-colors hover:text-gold"
            >
              <CheckCheck className="size-3.5" />
              Tout lire
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer les notifications"
            className="grid size-11 shrink-0 place-items-center border border-line text-navy transition-colors hover:border-gold"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {isPending ? (
            <div className="space-y-px">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="skeleton h-[4.75rem]" />
              ))}
            </div>
          ) : data.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Aucune notification.</p>
          ) : (
            <ul>
              {data.map((n, i) => {
                const Icon = ICONS[n.kind];
                const row = (
                  <>
                    <span
                      className={cn(
                        "mt-0.5 grid size-9 shrink-0 place-items-center border border-line bg-sand",
                        TONES[n.kind],
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start gap-2">
                        <span className="min-w-0 flex-1 text-sm font-medium text-navy">
                          {n.title}
                        </span>
                        {!n.read ? (
                          <span aria-label="Non lue" className="mt-1.5 size-2 shrink-0 bg-gold" />
                        ) : null}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                        {n.body}
                      </span>
                      <span className="mt-1.5 block text-[0.65rem] tracking-[0.1em] text-muted-foreground/80 uppercase">
                        {relativeTime(n.createdAt)}
                      </span>
                    </span>
                  </>
                );

                const cls = cn(
                  "stagger-in flex w-full items-start gap-3 border-b border-line p-4 text-left transition-colors hover:bg-sand",
                  !n.read && "bg-gold/[0.04]",
                );

                return (
                  <li key={n.id} style={{ ["--i" as string]: i }}>
                    {n.href ? (
                      <Link
                        to={n.href}
                        className={cls}
                        onClick={() => {
                          readOne.mutate(n.id);
                          onClose();
                        }}
                      >
                        {row}
                      </Link>
                    ) : (
                      <button type="button" onClick={() => readOne.mutate(n.id)} className={cls}>
                        {row}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
