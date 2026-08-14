import { Link, useRouterState } from "@tanstack/react-router";
import { PanelLeftClose, PanelLeftOpen, ArrowUpRight } from "lucide-react";
import logo from "@/assets/mabanis-logo.png";
import { navGroupsFor, type NavItem } from "@/lib/admin/nav";
import { useSession } from "@/lib/admin/session";
import { cn } from "@/lib/utils";

/** Rail widths. Kept here so the shell can offset content by the same values. */
export const RAIL_EXPANDED = "16.5rem";
export const RAIL_COLLAPSED = "4.5rem";

function isActive(pathname: string, to: string) {
  return to === "/admin" ? pathname === "/admin" : pathname.startsWith(to);
}

function NavRow({
  item,
  collapsed,
  active,
  index,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
  index: number;
}) {
  const Icon = item.icon;

  const body = (
    <>
      {/* Active marker slides in from the left edge. */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-1 left-0 w-[3px] origin-top bg-gold transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]",
          active ? "scale-y-100" : "scale-y-0",
        )}
      />
      <Icon
        className={cn(
          "size-[1.15rem] shrink-0 transition-colors duration-300",
          active ? "text-gold" : "text-admin-sidebar-muted group-hover:text-admin-sidebar-fg",
        )}
      />
      {/* Hidden rather than faded when collapsed: an opacity-0 label still holds
          its flex width and would push the icon off the rail's centre. */}
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-left text-[0.82rem] transition-[opacity,transform] duration-300",
          collapsed ? "hidden" : "translate-x-0 opacity-100",
        )}
      >
        {item.label}
      </span>
      {!item.ready && !collapsed ? (
        <span className="shrink-0 rounded-md border border-admin-sidebar-muted/40 px-1.5 py-0.5 text-[0.55rem] tracking-[0.14em] text-admin-sidebar-muted uppercase">
          P{item.phase}
        </span>
      ) : null}
    </>
  );

  const className = cn(
    "group relative flex items-center py-2.5 transition-colors duration-300",
    // Collapsed, the icon is the entire row, so it sits on the rail's centre line
    // instead of keeping the expanded row's left indent.
    collapsed ? "justify-center px-0" : "gap-3 pr-3 pl-4",
    active
      ? "bg-admin-sidebar-hover text-admin-sidebar-fg"
      : "text-admin-sidebar-muted hover:bg-admin-sidebar-hover/60 hover:text-admin-sidebar-fg",
  );

  // Screens that don't exist yet stay visible but inert, so the information
  // architecture is legible without dead links.
  if (!item.ready) {
    return (
      <span
        className={cn(className, "cursor-not-allowed opacity-60")}
        title={`${item.label}   phase ${item.phase}`}
        style={{ ["--i" as string]: index }}
      >
        {body}
      </span>
    );
  }

  return (
    <Link
      to={item.to}
      className={className}
      title={collapsed ? item.label : undefined}
      style={{ ["--i" as string]: index }}
    >
      {body}
    </Link>
  );
}

export function AdminSidebar({
  collapsed,
  onToggle,
  className,
}: {
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { role } = useSession();
  const groups = navGroupsFor(role);

  return (
    <aside
      className={cn(
        "rail-transition flex h-full flex-col overflow-hidden bg-admin-sidebar text-admin-sidebar-fg",
        className,
      )}
      style={{ width: collapsed ? RAIL_COLLAPSED : RAIL_EXPANDED }}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center gap-3 border-b border-white/10",
          collapsed ? "justify-center px-2" : "px-4",
        )}
      >
        <Link to="/admin" className="flex min-w-0 items-center gap-3">
          {/* Sized by width, because width is what the collapsed rail rations:
              the lockup is 1254×717, so the old h-8 drew it 56px wide inside a
              72px rail whose padding left 40px   hence the clipping. w-10 is
              40px × 23px collapsed, w-12 is 48px × 27px expanded. */}
          <img
            src={logo}
            alt="STE MABANIS"
            width={1254}
            height={717}
            className={cn(
              "h-auto shrink-0 brightness-0 invert transition-[width] duration-400",
              collapsed ? "w-10" : "w-12",
            )}
          />
        </Link>
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-[0.6rem] tracking-[0.2em] text-admin-sidebar-muted uppercase transition-opacity duration-300",
            collapsed ? "hidden" : "opacity-100",
          )}
        >
          Admin
        </span>
      </div>

      <nav className="scrollbar-gold flex-1 overflow-x-hidden overflow-y-auto py-4">
        {groups.map((group, gi) => (
          <div key={group.title} className={gi === 0 ? "" : "mt-5"}>
            <p
              className={cn(
                "px-4 pb-2 text-[0.58rem] tracking-[0.22em] text-admin-sidebar-muted/70 uppercase transition-[opacity,height] duration-300",
                collapsed ? "h-0 overflow-hidden opacity-0" : "h-auto opacity-100",
              )}
            >
              {group.title}
            </p>
            {/* A hairline stands in for the group label when collapsed. */}
            {collapsed && gi > 0 ? <div className="mx-4 mb-2 h-px bg-white/10" /> : null}
            <div className="flex flex-col">
              {group.items.map((item, ii) => (
                <NavRow
                  key={item.to + item.label}
                  item={item}
                  collapsed={collapsed}
                  active={isActive(pathname, item.to)}
                  index={gi * 3 + ii}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-white/10 p-3">
        <a
          href="/"
          className={cn(
            "group mb-2 flex items-center gap-3 px-1 py-2 text-[0.75rem] text-admin-sidebar-muted transition-colors hover:text-gold",
            collapsed && "justify-center",
          )}
          title={collapsed ? "Voir le site public" : undefined}
        >
          <ArrowUpRight className="size-4 shrink-0" />
          <span className={cn("truncate transition-opacity duration-300", collapsed && "hidden")}>
            Voir le site
          </span>
        </a>
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Déplier le menu" : "Replier le menu"}
          className={cn(
            "flex w-full items-center gap-3 px-1 py-2 text-[0.75rem] text-admin-sidebar-muted transition-colors hover:text-admin-sidebar-fg",
            collapsed && "justify-center",
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4 shrink-0" />
          ) : (
            <PanelLeftClose className="size-4 shrink-0" />
          )}
          <span className={cn("truncate transition-opacity duration-300", collapsed && "hidden")}>
            Replier
          </span>
        </button>
      </div>
    </aside>
  );
}
