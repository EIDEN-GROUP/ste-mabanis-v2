import { useEffect } from "react";
import Lenis from "lenis";
import { registerScrollPauser } from "@/lib/scroll-lock";

let instance: Lenis | null = null;

/** The running Lenis instance, or null when smooth scrolling is off. */
export function getLenis() {
  return instance;
}

/** Scroll helper that works whether or not Lenis is running. */
export function scrollToTop() {
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(0, { duration: 1.4 });
    return;
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Lenis inertia scrolling for the public site. It drives the real window
 * scroll position, so IntersectionObserver reveals and Framer Motion's
 * useScroll keep working untouched. Disabled when the OS asks for reduced
 * motion, and never mounted on the back office.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      // Exponential ease-out   long glide, no rubber band at the end.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.8,
      // Sans cela, Lenis avale le geste au-dessus d'un panneau qui défile pour
      // son compte (menu, tiroir de filtres) et c'est la page qui bouge  
      // ou, quand elle est gelée, plus rien du tout.
      allowNestedScroll: true,
      autoRaf: true,
    });
    instance = lenis;

    // Une page gelée doit aussi couper l'inertie, sinon le geste relâché
    // continue de courir sous le panneau.
    registerScrollPauser((locked, position) => {
      if (locked) {
        lenis.stop();
        return;
      }
      lenis.scrollTo(position, { immediate: true });
      lenis.start();
    });

    return () => {
      registerScrollPauser(null);
      lenis.destroy();
      instance = null;
    };
  }, []);

  return null;
}
