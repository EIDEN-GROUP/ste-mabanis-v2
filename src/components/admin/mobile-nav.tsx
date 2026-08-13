import { useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { X, ArrowUpRight } from "lucide-react";
import logo from "@/assets/mabanis-logo.png";
import { bottomNavItemsFor, navGroupsFor } from "@/lib/admin/nav";
import { useSession } from "@/lib/admin/session";
import { cn } from "@/lib/utils";

function isActive(pathname: string, to: string) {
  return to === "/admin" ? pathname === "/admin" : pathname.startsWith(to);
}

/** Full-height drawer for the complete site map on phones and tablets. */
export function AdminNavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { role } = useSession();
  const groups = navGroupsFor(role);

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
          "fixed inset-0 z-[80] bg-navy/50 backdrop-blur-[2px] transition-opacity duration-400 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu administration"
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 left-0 z-[90] flex w-[min(20rem,85vw)] flex-col bg-admin-sidebar text-admin-sidebar-fg transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] motion-reduce:transition-none lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4">
          <img
            src={logo}
            alt="STE MABANIS"
            width={200}
            height={200}
            className="h-8 w-auto brightness-0 invert"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le menu"
            className="grid size-9 place-items-center border border-white/20 transition-colors hover:border-gold"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {groups.map((group) => (
            <div key={group.title} className="mb-5">
              <p className="px-5 pb-2 text-[0.58rem] tracking-[0.22em] text-admin-sidebar-muted/70 uppercase">
                {group.title}
              </p>
              {group.items.map((item, i) => {
                const Icon = item.icon;
                const active = isActive(pathname, item.to);
                const inner = (
                  <>
                    <Icon
                      className={cn("size-[1.15rem] shrink-0", active ? "text-gold" : "opacity-70")}
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                    {!item.ready ? (
                      <span className="border border-admin-sidebar-muted/40 px-1.5 py-0.5 text-[0.55rem] tracking-[0.14em] uppercase">
                        P{item.phase}
                      </span>
                    ) : null}
                  </>
                );
                // 48px min height keeps every row a comfortable touch target.
                const cls = cn(
                  "flex min-h-12 items-center gap-3 px-5 py-3 text-sm",
                  active
                    ? "bg-admin-sidebar-hover text-admin-sidebar-fg"
                    : "text-admin-sidebar-muted",
                );
                return item.ready ? (
                  <Link key={item.to + item.label} to={item.to} onClick={onClose} className={cls}>
                    {inner}
                  </Link>
                ) : (
                  <span key={item.to + item.label} className={cn(cls, "opacity-55")}>
                    {inner}
                  </span>
                );
              })}
            </div>
          ))}
        </nav>

        <Link
          to="/"
          onClick={onClose}
          className="flex min-h-12 shrink-0 items-center gap-3 border-t border-white/10 px-5 py-3 text-sm text-admin-sidebar-muted transition-colors hover:text-gold"
        >
          <ArrowUpRight className="size-4" />
          Voir le site public
        </Link>
      </div>
    </>
  );
}

/** Bottom bar — the four most-used destinations, thumb height. */
export function AdminBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { role } = useSession();
  const items = bottomNavItemsFor(role);

  return (
    <nav
      aria-label="Navigation principale"
      // Visible until the desktop rail takes over at lg, so tablets keep a
      // persistent nav instead of relying on the burger alone.
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-admin-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(pathname, item.to);
        const inner = (
          <>
            <span className="relative">
              <Icon className={cn("size-5", active ? "text-gold" : "text-muted-foreground")} />
            </span>
            <span
              className={cn(
                "text-[0.62rem] tracking-[0.08em]",
                active ? "text-navy" : "text-muted-foreground",
              )}
            >
              {item.label}
            </span>
          </>
        );
        const cls =
          "flex min-h-14 flex-col items-center justify-center gap-1 py-2 transition-colors";
        return item.ready ? (
          <Link key={item.to + item.label} to={item.to} className={cls}>
            {inner}
          </Link>
        ) : (
          <span key={item.to + item.label} className={cn(cls, "opacity-45")}>
            {inner}
          </span>
        );
      })}
    </nav>
  );
}
