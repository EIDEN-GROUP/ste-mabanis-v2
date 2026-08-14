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
import { useEffect, useState, type ReactNode } from "react";
import { MotionConfig, motion } from "framer-motion";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BrandLoader } from "@/components/brand-loader";
import { useBrandIntro, type IntroPhase } from "@/hooks/use-brand-intro";
import { NotFound } from "@/components/not-found";
import { SmoothScroll, getLenis } from "@/components/smooth-scroll";
import { EASE } from "@/components/motion";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { Toaster } from "@/components/ui/sonner";

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
            className="bg-gold px-6 py-3 rounded-md text-xs tracking-[0.18em] text-navy uppercase"
          >
            Réessayer
          </button>
          <a
            href="/"
            className="border border-white/25 rounded-md px-6 py-3 text-xs tracking-[0.18em] uppercase"
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
      { title: "STE MABANIS | Agence immobilière à Agadir" },
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
  notFoundComponent: NotFound,
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
  // Le rideau d'ouverture et la page qui monte derrière lui partagent la même
  // horloge : la page démarre sa remontée à la seconde où les lames se lèvent.
  const intro = useBrandIntro();
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
          OS asks for reduced motion   no per-component branching needed. */}
      <MotionConfig reducedMotion="user">
        <BrandLoader phase={intro.phase} />
        <SmoothScroll />
        <SiteHeader />
        {/* Opaque and stacked above the footer, which is pinned behind the page
            and uncovered as this block scrolls off it. */}
        <main className="relative z-10 bg-background">
          {/* Keyed on the path so each page fades up on arrival. Required: nested
              routes render here   removing <Outlet /> breaks all child routes. */}
          <PageTransition pathname={pathname} phase={intro.phase} skipped={intro.skipped}>
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

function PageTransition({
  pathname,
  phase,
  skipped,
  children,
}: {
  pathname: string;
  phase: IntroPhase;
  skipped: boolean;
  children: ReactNode;
}) {
  // Lenis keeps its own scroll position, so jump it back to the top itself.
  useEffect(() => {
    getLenis()?.scrollTo(0, { immediate: true });
  }, [pathname]);

  // La clé est portée par l'enfant : `PageBody` se remonte à chaque route, donc
  // il sait, à sa naissance, s'il arrive derrière le rideau ou en navigation.
  return (
    <PageBody key={pathname} phase={phase} skipped={skipped}>
      {children}
    </PageBody>
  );
}

function PageBody({
  phase,
  skipped,
  children,
}: {
  phase: IntroPhase;
  skipped: boolean;
  children: ReactNode;
}) {
  const [behindCurtain] = useState(() => phase !== "done");

  // Premier chargement : la page attend sous le bord de l'écran et remonte
  // pendant que les lames du rideau se relèvent.
  //
  // Transition CSS et non Framer : l'état d'arrivée est écrit dans le DOM tout
  // de suite. Une animation JavaScript, elle, ne tourne pas dans un onglet en
  // arrière-plan   la page y resterait invisible jusqu'à ce qu'on y revienne.
  if (behindCurtain) {
    return (
      <div
        className="transition-[opacity,transform] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
        style={{
          transitionDuration: skipped ? "0ms" : "1250ms",
          transitionDelay: skipped ? "0ms" : "100ms",
          opacity: phase === "in" ? 0 : 1,
          // `none` et pas `translateY(0)` : un transform, même nul, ferait de ce
          // bloc le référent des enfants en `position: fixed` (le panneau de
          // filtres de /proprietes, par exemple), qui ne colleraient plus à
          // l'écran. La transition interpole quand même depuis `translateY`.
          transform: phase === "in" ? "translateY(7vh)" : "none",
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
