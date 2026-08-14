import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Phone, Mail, Facebook, AtSign, Instagram, LayoutDashboard } from "lucide-react";
import logo from "@/assets/mabanis-logo.png";
import { setScrollLocked } from "@/lib/scroll-lock";
import { agency, images, socials } from "@/lib/site-data";
import { cn } from "@/lib/utils";

/** Lucide has no Threads glyph; the @ mark stands in for the handle. */
const SOCIAL_ICONS = {
  Instagram,
  Threads: AtSign,
  Facebook,
} as const;

/** Slim inline nav   the full site map lives in the overlay menu. */
const nav = [
  { to: "/agence", label: "L'agence" },
  { to: "/proprietes", label: "Propriétés" },
  { to: "/quartiers", label: "Quartiers" },
  { to: "/vendre", label: "Vendre" },
] as const;

/** `hash` targets a band of the agency page, which now carries services and team. */
type MenuLink = { to: string; label: string; search?: Record<string, string>; hash?: string };

const menuGroups: { title: string; links: MenuLink[] }[] = [
  {
    title: "Vous souhaitez acheter ?",
    links: [
      { to: "/proprietes", label: "Biens à vendre", search: { transaction: "vente" } },
      { to: "/quartiers", label: "Quartiers d'Agadir" },
      { to: "/agence", label: "Accompagnement achat", hash: "services" },
    ],
  },
  {
    title: "Vous souhaitez vendre ?",
    links: [
      { to: "/vendre", label: "Vendre" },
      // { to: "/vendre", label: "Estimer" },
      { to: "/temoignages", label: "Ils nous ont fait confiance" },
    ],
  },
  {
    title: "Location à Agadir",
    links: [
      { to: "/proprietes", label: "Biens à louer", search: { transaction: "location" } },
      { to: "/agence", label: "Gestion locative", hash: "services" },
    ],
  },
  {
    title: "À propos",
    links: [
      { to: "/agence", label: "Notre agence" },
      { to: "/actualites", label: "Actualités" },
      { to: "/contact", label: "Contact" },
    ],
  },
];

const panelImages = [images.property1, images.locationTaghazout, images.editorial1];

/** Open sweeps left→right: the photo wipes, then three slices of the panel. */
const SLICES = 3;
const ENTER = {
  wipe: 700,
  slice: 620,
  sliceLead: 140,
  sliceStep: 80,
  content: 420,
  contentStep: 70,
};
const EXIT = { wipe: 520, slice: 480, sliceStep: 60, content: 220 };
const EXIT_TOTAL = 780;
const EASE = "cubic-bezier(0.76, 0, 0.24, 1)";

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const reduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    // Le gel du corps et l'arrêt de l'inertie vivent au même endroit : sur iOS,
    // `overflow: hidden` seul laisse la page filer sous le panneau.
    setScrollLocked(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      setScrollLocked(false);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Slow crossfade behind the menu, like the reference.
  useEffect(() => {
    if (!open || reduced) return;
    const id = setInterval(() => setSlide((s) => (s + 1) % panelImages.length), 5200);
    return () => clearInterval(id);
  }, [open, reduced]);

  // Every public page opens on a dark full-bleed hero, so the bar rides over it
  // transparent and only takes its white ground once the visitor scrolls away.
  const solid = scrolled;
  const ms = (n: number) => (reduced ? 0 : n);

  // Open: the logo sits on the photo half at lg+, but on the pale panel below it.
  const logoTone = open ? "lg:brightness-0 lg:invert" : solid ? "" : "brightness-0 invert";

  const sliceStyle = (i: number) => ({
    transitionDuration: `${ms(open ? ENTER.slice : EXIT.slice)}ms`,
    transitionDelay: `${ms(
      open ? ENTER.sliceLead + i * ENTER.sliceStep : (SLICES - 1 - i) * EXIT.sliceStep,
    )}ms`,
    transitionTimingFunction: EASE,
  });

  const contentStyle = (i: number) => ({
    transitionDuration: `${ms(open ? 620 : EXIT.content)}ms`,
    transitionDelay: `${ms(open ? ENTER.content + i * ENTER.contentStep : 0)}ms`,
  });

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[70] transition-[background-color,border-color,padding] duration-500 motion-reduce:transition-none",
          open
            ? "border-b border-transparent py-5"
            : solid
              ? "border-b border-line bg-background/95 py-3 backdrop-blur-md"
              : "border-b border-white/10 py-5",
        )}
      >
        <div className="mx-auto flex max-w-[100rem] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
          <Link to="/" className="ml-2 shrink-0" aria-label="STE MABANIS accueil">
            <img
              src={logo}
              alt="STE MABANIS"
              width={500}
              height={200}
              className={cn(
                "h-11 w-full transition-all duration-500 motion-reduce:transition-none sm:h-14",
                logoTone,
              )}
            />
          </Link>
          <nav
            className={cn(
              "ml-auto hidden items-center gap-7 transition-[opacity,transform] duration-400 motion-reduce:transition-none lg:flex",
              open ? "pointer-events-none -translate-y-1 opacity-0" : "translate-y-0 opacity-100",
            )}
          >
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "link-underline text-[0.78rem] tracking-[0.1em] uppercase transition-colors",
                  solid ? "text-navy/75 hover:text-navy" : "text-white/80 hover:text-white",
                )}
                activeProps={{ className: solid ? "text-navy" : "text-white" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3 lg:ml-0 lg:gap-5">
            <div
              className={cn(
                "flex items-center gap-3 transition-opacity duration-300 motion-reduce:transition-none",
                open ? "pointer-events-none opacity-0" : "opacity-100",
              )}
            >
              {/* <a
                href={`tel:${agency.mobile.replace(/\s/g, "")}`}
                className={cn(
                  "hidden items-center gap-2 text-xs tracking-wide xl:inline-flex",
                  solid ? "text-navy/70" : "text-white/75",
                )}
              >
                <Phone className="size-3.5 text-gold" />
                {agency.mobile}
              </a> */}
              {/* <Link
                to="/admin"
                aria-label="Ouvrir le tableau de bord"
                className={cn(
                  "hidden items-center gap-2 border px-4 py-2.5 text-[0.7rem] tracking-[0.16em] uppercase transition-colors lg:inline-flex",
                  solid
                    ? "border-line text-navy/80 hover:border-gold hover:text-navy"
                    : "border-white/35 text-white/85 hover:border-white hover:text-white",
                )}
              >
                <LayoutDashboard className="size-3.5 text-gold" />
                Dashboard
              </Link> */}
              <Link
                to="/contact"
                className="hidden rounded-md bg-gold px-5 py-2.5 text-[0.7rem] tracking-[0.16em] text-navy uppercase transition-colors hover:bg-navy hover:text-white sm:inline-block"
              >
                Nous contacter
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              className={cn(
                // The border colours below never showed without a width to draw.
                "flex size-11 shrink-0 items-center justify-center transition-colors duration-500 motion-reduce:transition-none sm:size-10",
                open
                  ? "border-gold text-navy"
                  : solid
                    ? "border-line text-navy hover:border-gold"
                    : "border-white/40 text-white hover:border-white",
              )}
            >
              <span className="flex w-8 flex-col items-stretch gap-[4px]">
                <span
                  className={cn(
                    "h-px w-full bg-current transition-transform duration-500 motion-reduce:transition-none",
                    open && "translate-y-[5px] rotate-45",
                  )}
                />
                <span
                  className={cn(
                    "h-px w-full bg-current transition-opacity duration-300 motion-reduce:transition-none",
                    open && "opacity-0",
                  )}
                />
                <span
                  className={cn(
                    "h-px w-full bg-current transition-transform duration-500 motion-reduce:transition-none",
                    open && "-translate-y-[5px] -rotate-45",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Stays mounted so the sweep can transition in and back out. */}
      <div
        className={cn("fixed inset-0 z-[60]", open ? "visible" : "pointer-events-none invisible")}
        style={{
          transition: `visibility 0s linear ${ms(open ? 0 : EXIT_TOTAL)}ms`,
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal"
        aria-hidden={!open}
      >
        {/* Left half   photo, wipes in from the left edge */}
        <div
          className="absolute inset-y-0 left-0 hidden w-1/2 overflow-hidden bg-navy transition-[clip-path] lg:block"
          style={{
            clipPath: open ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
            transitionDuration: `${ms(open ? ENTER.wipe : EXIT.wipe)}ms`,
            transitionDelay: `${ms(open ? 0 : 200)}ms`,
            transitionTimingFunction: EASE,
          }}
        >
          {panelImages.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              aria-hidden
              className={cn(
                "absolute inset-0 size-full object-cover transition-opacity duration-[1400ms] motion-reduce:transition-none",
                open && "menu-kenburns",
                i === slide ? "opacity-100" : "opacity-0",
              )}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-br from-navy/55 via-navy/15 to-transparent" />
        </div>

        {/* Right half   three slices sweeping in after the photo */}
        <div className="absolute inset-y-0 right-0 flex w-full lg:w-1/2">
          {Array.from({ length: SLICES }, (_, i) => (
            <span
              key={i}
              className={cn(
                "h-full flex-1 origin-left bg-background transition-transform",
                open ? "scale-x-100" : "scale-x-0",
              )}
              style={sliceStyle(i)}
            />
          ))}
        </div>

        {/* Menu content */}
        {/* `data-lenis-prevent` : le défilement inertiel intercepte les gestes
            au niveau de la fenêtre et, page gelée, les annule. Cet attribut lui
            dit de ne pas toucher à ce qui se passe dans le panneau   sans lui,
            le menu est immobile sur téléphone. `h-[100dvh]` (et non `inset-y-0`,
            qui vaut 100vh) suit la barre d'adresse de Safari : sans lui, sur
            iPhone, le panneau est plus haut que l'écran visible et le contenu
            du bas reste hors d'atteinte. */}
        <div
          data-lenis-prevent
          className="absolute top-0 right-0 flex h-[100dvh] w-full flex-col overflow-y-auto overscroll-contain px-6 pt-28 pb-10 sm:px-10 lg:w-1/2 lg:justify-center lg:px-16 lg:pt-16 lg:pb-8 xl:px-24"
        >
          <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:gap-y-8">
            {menuGroups.map((group, gi) => (
              <div
                key={group.title}
                className={cn(
                  "transition-[opacity,transform]",
                  open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                )}
                style={contentStyle(gi)}
              >
                <p className="eyebrow mb-4">{group.title}</p>
                <ul className="space-y-1.5">
                  {group.links.map((link) => (
                    <li key={`${link.to}-${link.label}`}>
                      <Link
                        to={link.to}
                        search={link.search as never}
                        {...(link.hash ? { hash: link.hash } : {})}
                        onClick={() => setOpen(false)}
                        className="display inline-block text-2xl text-navy transition-[color,transform] duration-400 hover:translate-x-1.5 hover:text-gold sm:text-[1.75rem]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div
            className={cn(
              "mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-line pt-8 transition-[opacity,transform] lg:mt-10 lg:pt-6",
              open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            )}
            style={contentStyle(menuGroups.length)}
          >
            <a
              href={`tel:${agency.mobile.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 text-sm text-navy/75 transition-colors hover:text-gold"
            >
              <Phone className="size-3.5 text-gold" />
              {agency.mobile}
            </a>
            <a
              href={`mailto:${agency.email}`}
              className="inline-flex items-center gap-2 text-sm text-navy/75 transition-colors hover:text-gold"
            >
              <Mail className="size-3.5 text-gold" />
              {agency.email}
            </a>
            {/* <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-2 border border-line px-3 py-2 text-[0.68rem] tracking-[0.14em] text-navy/80 uppercase transition-colors hover:border-gold hover:text-navy"
            >
              <LayoutDashboard className="size-3.5 text-gold" />
              Dashboard
            </Link> */}
            <div className="ml-auto flex items-center gap-3">
              {socials.map((social) => {
                const Icon = SOCIAL_ICONS[social.label];
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={social.label}
                    className="flex size-9 items-center justify-center rounded-md border border-line text-navy/70 transition-colors hover:border-gold hover:text-gold"
                  >
                    <Icon className="size-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
