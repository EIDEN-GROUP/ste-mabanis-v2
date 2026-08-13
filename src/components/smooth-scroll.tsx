import { useEffect } from "react";
import Lenis from "lenis";

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

/** Freezes/unfreezes the page — used by the overlay menu. */
export function setScrollLocked(locked: boolean) {
  const lenis = getLenis();
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
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
      // Exponential ease-out — long glide, no rubber band at the end.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.8,
      autoRaf: true,
    });
    instance = lenis;

    return () => {
      lenis.destroy();
      instance = null;
    };
  }, []);

  return null;
}
