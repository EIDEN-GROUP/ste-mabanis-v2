import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { MotionConfig, motion } from "framer-motion";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BrandLoader } from "@/components/brand-loader";
import { SmoothScroll, getLenis } from "@/components/smooth-scroll";
import { EASE } from "@/components/motion";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4 text-white">
      <div className="max-w-md text-center">
        <p className="eyebrow">Erreur 404</p>
        <h1 className="display mt-4 text-6xl">Cette page n'existe plus</h1>
        <p className="mt-4 text-sm text-white/60">
          Le bien ou la page que vous cherchez a peut-être été vendu, loué ou déplacé.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/proprietes"
            className="bg-gold px-6 py-3 text-xs tracking-[0.18em] text-navy uppercase"
          >
            Voir les biens
          </Link>
          <Link
            to="/"
            className="border border-white/25 px-6 py-3 text-xs tracking-[0.18em] uppercase"
          >
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4 text-white">
      <div className="max-w-md text-center">
        <h1 className="display text-4xl">Cette page n'a pas pu se charger</h1>
        <p className="mt-3 text-sm text-white/60">
          Un incident technique est survenu. Réessayez ou revenez à l'accueil.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="bg-gold px-6 py-3 text-xs tracking-[0.18em] text-navy uppercase"
          >
            Réessayer
          </button>
          <a
            href="/"
            className="border border-white/25 px-6 py-3 text-xs tracking-[0.18em] uppercase"
          >
            Accueil
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "STE MABANIS — Agence immobilière à Agadir" },
      {
        name: "description",
        content:
          "Vente, location, estimation et gestion locative à Agadir et sur le littoral. Villas, appartements et investissements sélectionnés par STE MABANIS.",
      },
      { name: "author", content: "STE MABANIS" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#071A2F" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..700;1,400..700&family=Roboto:wght@300;400;500;700&family=Sarabun:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // The admin brings its own shell (sidebar, header, bottom nav), so it must not
  // inherit the public site's header, footer or WhatsApp button.
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return (
      <QueryClientProvider client={queryClient}>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <Toaster position="top-right" />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      {/* "user" lets Framer Motion drop transform animations by itself when the
          OS asks for reduced motion — no per-component branching needed. */}
      <MotionConfig reducedMotion="user">
        <BrandLoader />
        <SmoothScroll />
        <SiteHeader />
        {/* Opaque and stacked above the footer, which is pinned behind the page
            and uncovered as this block scrolls off it. */}
        <main className="relative z-10 bg-background">
          {/* Keyed on the path so each page fades up on arrival. Required: nested
              routes render here — removing <Outlet /> breaks all child routes. */}
          <PageTransition pathname={pathname}>
            <Outlet />
          </PageTransition>
        </main>
        <SiteFooter />
        <WhatsAppButton />
        <Toaster position="bottom-center" />
      </MotionConfig>
    </QueryClientProvider>
  );
}

function PageTransition({ pathname, children }: { pathname: string; children: ReactNode }) {
  // Lenis keeps its own scroll position, so jump it back to the top itself.
  useEffect(() => {
    getLenis()?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
