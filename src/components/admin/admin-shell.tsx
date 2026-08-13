import { useEffect, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";
import { AdminBottomNav, AdminNavDrawer } from "./mobile-nav";
import { NotificationCenter } from "./notification-center";

const STORAGE_KEY = "mabanis:admin:rail-collapsed";

export function AdminShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Read the stored preference after mount so SSR and hydration agree.
  useEffect(() => {
    setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  const toggleRail = () => {
    setCollapsed((v) => {
      const next = !v;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  };

  useEffect(() => {
    setDrawerOpen(false);
    setNotificationsOpen(false);
  }, [pathname]);

  return (
    <div className="font-admin flex min-h-screen bg-admin-bg">
      <AdminSidebar
        collapsed={collapsed}
        onToggle={toggleRail}
        className="sticky top-0 hidden h-screen shrink-0 lg:flex"
      />

      <AdminNavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          onOpenMenu={() => setDrawerOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
        />
        {/* pb clears the bottom bar, which persists until lg. */}
        <main className="flex-1 px-4 pt-5 pb-24 sm:px-6 lg:px-8 lg:pt-7 lg:pb-8">{children}</main>
      </div>

      <AdminBottomNav />
      <NotificationCenter open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </div>
  );
}
