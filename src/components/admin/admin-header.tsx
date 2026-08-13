import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, Check, ChevronDown, Menu, Search, UserRound } from "lucide-react";
import { notificationsQuery } from "@/lib/admin/queries";
import { allNavItemsFor, pathAllowedFor } from "@/lib/admin/nav";
import { useAgentsForRole, useSession } from "@/lib/admin/session";
import { STAFF_ROLES, type StaffRole } from "@/lib/admin/types";
import { toast } from "@/components/admin/primitives";
import { cn } from "@/lib/utils";

const ROLE_ORDER: StaffRole[] = ["directrice", "commercial", "assistant"];

function useCurrentTitle() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { role } = useSession();
  const match = [...allNavItemsFor(role)]
    .sort((a, b) => b.to.length - a.to.length)
    .find((i) => (i.to === "/admin" ? pathname === "/admin" : pathname.startsWith(i.to)));
  return match?.label ?? "Administration";
}

export function AdminHeader({
  onOpenNotifications,
  onOpenMenu,
}: {
  onOpenNotifications: () => void;
  onOpenMenu: () => void;
}) {
  const title = useCurrentTitle();
  const { data = [] } = useQuery(notificationsQuery());
  const unread = data.filter((n) => !n.read).length;
  const { role, roleInfo, agentId, switchRole, switchAgent } = useSession();
  const agents = useAgentsForRole("commercial");
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const pickRole = (next: StaffRole) => {
    switchRole(next);
    setOpen(false);
    if (!pathAllowedFor(next, pathname)) {
      const first = allNavItemsFor(next)[0];
      if (first) void navigate({ to: first.to });
    }
    toast.success("Espace activé", `${STAFF_ROLES[next].label} — ${STAFF_ROLES[next].tagline}.`);
  };

  const pickAgent = (id: string) => {
    switchAgent(id);
    toast.success(
      "Espace commercial",
      `Vous travaillez désormais avec ${agents.find((a) => a.id === id)?.name ?? "l'agent sélectionné"}.`,
    );
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-admin-surface/95 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Ouvrir le menu"
        className="grid size-10 shrink-0 place-items-center border border-line text-navy transition-colors hover:border-gold lg:hidden"
      >
        <Menu className="size-4.5" />
      </button>

      <div className="min-w-0 flex-1">
        <p className="hidden text-[0.58rem] tracking-[0.22em] text-muted-foreground uppercase sm:block">
          STE MABANIS
        </p>
        <h1 className="display truncate text-xl leading-tight sm:text-2xl">{title}</h1>
      </div>

      {/* Search collapses to an icon button on small screens. */}
      <label className="relative hidden items-center md:flex">
        <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Rechercher…"
          aria-label="Rechercher"
          className="h-10 w-52 border border-line bg-background pr-3 pl-9 text-sm transition-[width,border-color] duration-300 outline-none placeholder:text-muted-foreground focus:w-72 focus:border-gold lg:w-64 lg:focus:w-80"
        />
      </label>
      <button
        type="button"
        aria-label="Rechercher"
        className="grid size-10 shrink-0 place-items-center border border-line text-navy transition-colors hover:border-gold md:hidden"
      >
        <Search className="size-4" />
      </button>

      <div className="relative shrink-0" ref={panelRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={`Mon espace : ${roleInfo.label}`}
          className="flex h-10 items-center gap-2 border border-line bg-admin-surface px-3 text-sm transition-colors hover:border-gold"
        >
          <span className="size-2 shrink-0 rounded-full bg-gold" />
          <span className="hidden max-w-[10rem] truncate text-navy sm:block">
            {roleInfo.label}
          </span>
          <ChevronDown className={cn("size-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
        </button>

        {open ? (
          <div className="absolute right-0 z-50 mt-2 w-[21rem] border border-line bg-admin-surface shadow-panel">
            <div className="border-b border-line px-4 py-3">
              <p className="text-[0.58rem] tracking-[0.2em] text-muted-foreground uppercase">
                Mon espace de travail
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Choisissez un rôle pour voir ses accès et ses actions.
              </p>
            </div>

            <ul className="max-h-72 overflow-y-auto">
              {ROLE_ORDER.map((r) => {
                const info = STAFF_ROLES[r];
                const active = r === role;
                return (
                  <li key={r}>
                    <button
                      type="button"
                      onClick={() => pickRole(r)}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
                        active ? "bg-sand" : "hover:bg-sand/60",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-1.5 size-2 shrink-0 rounded-full",
                          active ? "bg-gold" : "bg-muted-foreground/40",
                        )}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 text-sm font-medium text-navy">
                          {info.label}
                          {active ? <Check className="size-3.5 text-gold" /> : null}
                        </span>
                        <span className="block text-xs text-muted-foreground">{info.tagline}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {role === "commercial" ? (
              <div className="border-t border-line px-4 py-3">
                <p className="text-[0.58rem] tracking-[0.2em] text-muted-foreground uppercase">
                  Travailler comme
                </p>
                <ul className="mt-2 space-y-1">
                  {agents.map((a) => (
                    <li key={a.id}>
                      <button
                        type="button"
                        onClick={() => pickAgent(a.id)}
                        className={cn(
                          "flex w-full items-center gap-2.5 px-2 py-1.5 text-sm transition-colors",
                          agentId === a.id
                            ? "bg-sand text-navy"
                            : "text-muted-foreground hover:bg-sand/60 hover:text-navy",
                        )}
                      >
                        <UserRound className="size-3.5 text-gold" />
                        <span className="flex-1 truncate text-left">{a.name}</span>
                        {agentId === a.id ? <Check className="size-3.5 text-gold" /> : null}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="border-t border-line bg-admin-bg/60 px-4 py-3">
              <p className="text-[0.58rem] tracking-[0.2em] text-muted-foreground uppercase">
                Dans cet espace
              </p>
              <ul className="mt-1.5 space-y-1">
                {roleInfo.capabilities.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-gold/70" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onOpenNotifications}
        aria-label={`Notifications${unread ? ` (${unread} non lues)` : ""}`}
        className="relative grid size-10 shrink-0 place-items-center border border-line text-navy transition-colors hover:border-gold"
      >
        <Bell className="size-4" />
        {unread > 0 ? (
          <span className="absolute -top-1.5 -right-1.5 grid size-[1.15rem] place-items-center bg-gold text-[0.6rem] font-medium text-navy tabular-nums">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>
    </header>
  );
}
