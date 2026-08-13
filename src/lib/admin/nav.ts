import {
  LayoutDashboard,
  Building2,
  Users,
  KanbanSquare,
  CalendarDays,
  Receipt,
  FolderOpen,
  CheckSquare,
  BarChart3,
  Workflow,
  Scale,
  Megaphone,
  UserRound,
  Palette,
  type LucideIcon,
} from "lucide-react";
import type { StaffRole } from "./types";

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Phase that introduces the screen; later phases render as "à venir". */
  phase: 2 | 3 | 4;
  ready: boolean;
  /** Roles allowed to see this item; omitted means every role. */
  roles?: StaffRole[] | undefined;
};

export type NavGroup = { title: string; items: NavItem[] };

export const navGroups: NavGroup[] = [
  {
    title: "Pilotage",
    items: [
      { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard, phase: 2, ready: true },
      { to: "/admin/design", label: "Design system", icon: Palette, phase: 2, ready: true, roles: ["directrice"] },
    ],
  },
  {
    title: "Portefeuille",
    items: [
      { to: "/admin/proprietes", label: "Propriétés", icon: Building2, phase: 2, ready: true },
      { to: "/admin/clients", label: "Clients", icon: Users, phase: 2, ready: true },
      { to: "/admin/crm", label: "Pipeline CRM", icon: KanbanSquare, phase: 2, ready: true, roles: ["directrice", "commercial"] },
    ],
  },
  {
    title: "Opérations",
    items: [
      { to: "/admin/agenda", label: "Agenda", icon: CalendarDays, phase: 3, ready: true },
      { to: "/admin/transactions", label: "Transactions", icon: Receipt, phase: 3, ready: true },
      { to: "/admin/documents", label: "Documents", icon: FolderOpen, phase: 3, ready: true },
      { to: "/admin/taches", label: "Tâches", icon: CheckSquare, phase: 3, ready: true },
    ],
  },
  {
    title: "Analyse",
    items: [{ to: "/admin/rapports", label: "Rapports", icon: BarChart3, phase: 4, ready: true, roles: ["directrice"] }],
  },
  {
    title: "Piloter",
    items: [
      { to: "/admin/automatisations", label: "Automatisations", icon: Workflow, phase: 4, ready: true, roles: ["directrice"] },
      { to: "/admin/matching", label: "Matching", icon: Scale, phase: 4, ready: true, roles: ["directrice", "commercial"] },
      { to: "/admin/marketing", label: "Marketing", icon: Megaphone, phase: 4, ready: true, roles: ["directrice"] },
      { to: "/admin/portail-client", label: "Portail client", icon: UserRound, phase: 4, ready: true, roles: ["directrice"] },
    ],
  },
];

export const allNavItems = navGroups.flatMap((g) => g.items);

/** The four destinations promoted to the mobile bottom bar. */
export const bottomNavItems: NavItem[] = [
  allNavItems[0]!,
  { to: "/admin/proprietes", label: "Biens", icon: Building2, phase: 2, ready: true },
  { to: "/admin/crm", label: "Pipeline", icon: KanbanSquare, phase: 2, ready: true, roles: ["directrice", "commercial"] },
  { to: "/admin/agenda", label: "Agenda", icon: CalendarDays, phase: 3, ready: true },
];

/* -------------------------------------------------- role-filtered views */

export function itemVisibleForRole(item: NavItem, role: StaffRole): boolean {
  return !item.roles || item.roles.includes(role);
}

export function navGroupsFor(role: StaffRole): NavGroup[] {
  return navGroups
    .map((g) => ({ ...g, items: g.items.filter((i) => itemVisibleForRole(i, role)) }))
    .filter((g) => g.items.length > 0);
}

export function allNavItemsFor(role: StaffRole): NavItem[] {
  return navGroupsFor(role).flatMap((g) => g.items);
}

export function bottomNavItemsFor(role: StaffRole): NavItem[] {
  return bottomNavItems.filter((i) => itemVisibleForRole(i, role));
}

/** Whether a given admin path is part of the role's workspace. */
export function pathAllowedFor(role: StaffRole, pathname: string): boolean {
  return allNavItemsFor(role).some((i) =>
    i.to === "/admin" ? pathname === "/admin" : pathname === i.to || pathname.startsWith(i.to + "/"),
  );
}
