import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { EASE } from "@/components/motion";
import { FooterBrand } from "@/components/footer/footer-brand";
import { FooterContact } from "@/components/footer/footer-contact";
import { FooterCTA } from "@/components/footer/footer-cta";
import { FooterNavigation } from "@/components/footer/footer-navigation";
import { scrollToTop } from "@/components/smooth-scroll";
import { agency } from "@/lib/site-data";
import { cn } from "@/lib/utils";

const legal = [
  "Mentions légales",
  "Politique de confidentialité",
  "Cookies",
  "Conditions d'utilisation",
];

/**
 * The closing scene: a pinned cinematic CTA, then a dark block that travels up
 * and closes over it like a curtain, ending on the wordmark at full width.
 *
 * The curtain is pure layout   the CTA is `sticky top-0` inside the tall footer,
 * and this block sits above it in the stacking order with an opaque background.
 * No fixed positioning, so the footer can be any height and everything inside
 * stays scrollable and clickable.
 *
 * z-80 puts the whole footer over the fixed header (z-70) and the floating
 * buttons: once the closing scene starts, it owns the screen edge to edge.
 */
export function SiteFooter() {
  // On /contact the page is already the invitation, so the CTA would ask twice.
  // Dropping it leaves the curtain intact: the dark block simply has nothing to
  // travel over, and the closing scene plays exactly as elsewhere.
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const showCTA = pathname !== "/contact";

  return (
    <footer className="relative z-[80] bg-ink text-white">
      {showCTA ? <FooterCTA /> : null}

      {/* One screen exactly: the coordinates block takes whatever room the
          wordmark and the legal bar leave. `min-h` rather than `h` so a short
          phone in landscape grows instead of clipping its own content. */}
      <div className="relative z-10 flex min-h-[100svh] flex-col bg-ink">
        {/* Wide-but-short screens (laptops at 720p, tablets in landscape) get the
            padding back: the block is centred, so dropping it only buys height. */}
        <div className="mx-auto flex w-full max-w-[100rem] flex-1 flex-col justify-center px-5 pt-8 pb-6 sm:px-8 sm:pt-20 sm:pb-10 sm:[@media(max-height:820px)]:pt-10 sm:[@media(max-height:820px)]:pb-6 lg:px-12 lg:pt-24">
          <div className="grid gap-8 sm:gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-20 xl:gap-28">
            <FooterContact />
            <FooterNavigation />
          </div>
        </div>

        <div className="px-3 sm:px-5">
          <FooterBrand />
        </div>

        <LegalBar />
      </div>

      <BackToTop />
    </footer>
  );
}

function LegalBar() {
  return (
    <motion.div
      className="mt-6 border-t border-white/10 sm:mt-10"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      <div className="mx-auto flex max-w-[100rem] flex-col gap-2 px-5 py-4 text-[0.7rem] text-white/40 sm:gap-3 sm:px-8 sm:py-6 sm:text-[0.72rem] lg:flex-row lg:items-center lg:justify-between lg:px-12">
        {/* Two tidy columns on a phone instead of three ragged wrapped lines. */}
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:flex sm:flex-wrap sm:gap-x-7 sm:gap-y-2">
          {legal.map((item) => (
            <li key={item}>
              {/* These pages do not exist in the router yet   styled as links,
                  not wired as ones, so none of them leads to a 404. */}
              <span className="cursor-pointer transition-colors duration-500 hover:text-white/80">
                {item}
              </span>
            </li>
          ))}
        </ul>
        <p className="shrink-0">
          © {new Date().getFullYear()} {agency.name}
        </p>
      </div>
    </motion.div>
  );
}

/** Fixed disc with a ring that fills as the page scrolls. */
function BackToTop() {
  const [progress, setProgress] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      setShow(window.scrollY > 600);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const R = 22;
  const C = 2 * Math.PI * R;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Revenir en haut de la page"
      className={cn(
        "group fixed right-4 bottom-20 z-40 grid size-12 place-items-center rounded-full bg-navy text-white backdrop-blur transition-[opacity,transform] duration-500 hover:text-gold sm:right-6 sm:bottom-24",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <svg viewBox="0 0 48 48" className="absolute inset-0 size-full -rotate-90">
        <circle cx="24" cy="24" r={R} fill="none" stroke="currentColor" strokeOpacity="0.2" />
        <circle
          cx="24"
          cy="24"
          r={R}
          fill="none"
          stroke="var(--gold)"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - progress)}
          style={{ transition: "stroke-dashoffset 200ms linear" }}
        />
      </svg>
      <ArrowUp className="relative size-4 transition-transform duration-500 group-hover:-translate-y-0.5" />
    </button>
  );
}
