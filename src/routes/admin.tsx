import { useEffect, useState } from "react";
import { createFileRoute, Navigate, Outlet, useRouterState } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/admin-shell";
import { SessionProvider, useSession } from "@/lib/admin/session";
import { readSignedIn } from "@/lib/admin/auth";
import { pathAllowedFor } from "@/lib/admin/nav";
import { toast } from "@/components/admin/primitives";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administration   STE MABANIS" },
      {
        name: "description",
        content: "Console de gestion STE MABANIS : portefeuille, CRM, agenda et transactions.",
      },
      // The back office must never be indexed.
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

/** Redirects to the dashboard when the workspace doesn't allow the current URL. */
function WorkspaceGuard() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { role, roleInfo } = useSession();
  const allowed = pathAllowedFor(role, pathname);

  // One toast per blocked visit, so a direct URL to a restricted screen is explained.
  useEffect(() => {
    if (allowed) return;
    toast.error(
      "Accès refusé",
      `Cet espace est réservé à ${roleInfo.label} vous avez été redirigé.`,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!allowed) {
    return <Navigate to="/admin" />;
  }
  return <Outlet />;
}

/**
 * Porte d'entrée du back-office.
 *
 * Le ticket vit dans le navigateur : il ne peut être lu qu'après le montage,
 * d'où le troisième état. Rendre la console pendant la vérification la ferait
 * clignoter chez un visiteur qui n'y a pas droit.
 */
function AdminLayout() {
  const [access, setAccess] = useState<"checking" | "granted" | "denied">("checking");

  useEffect(() => {
    setAccess(readSignedIn() ? "granted" : "denied");
  }, []);

  if (access === "checking") {
    return (
      <div className="grid min-h-[100svh] place-items-center bg-navy">
        <span className="size-2 animate-ping rounded-full bg-gold" />
      </div>
    );
  }

  if (access === "denied") {
    return <Navigate to="/admin/login" />;
  }

  return (
    <SessionProvider>
      <AdminShell>
        <WorkspaceGuard />
      </AdminShell>
    </SessionProvider>
  );
}
