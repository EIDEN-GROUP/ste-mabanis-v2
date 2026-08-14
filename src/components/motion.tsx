import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Transition,
} from "framer-motion";
import { cn } from "@/lib/utils";

/** House easing   the same curve every transition on the site leans on. */
export const EASE = [0.16, 1, 0.3, 1] as const;

const ENTER: Transition = { duration: 0.9, ease: EASE };

const VIEWPORT = { once: true, amount: 0.15, margin: "0px 0px -8% 0px" } as const;

/** Fade + rise, triggered the first time the block enters the viewport. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 26,
}: {
  children: ReactNode;
  className?: string;
  /** Milliseconds, to stay compatible with the rest of the codebase. */
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ ...ENTER, delay: delay / 1000 }}
    >
      {children}
    </motion.div>
  );
}

/** Headline that climbs word by word out of an overflow mask. */
export function TextReveal({
  text,
  className,
  delay = 0,
  step = 55,
}: {
  text: string;
  className?: string;
  delay?: number;
  step?: number;
}) {
  const words = text.split(" ");

  return (
    <motion.span
      className={cn("inline", className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: step / 1000, delayChildren: delay / 1000 } },
      }}
    >
      {words.map((word, i) => (
        <span key={`${word}-${i}`}>
          {/* The mask needs room for descenders, hence the vertical padding. */}
          <span className="inline-block overflow-hidden py-[0.14em] align-bottom">
            <motion.span
              className="inline-block"
              variants={{
                hidden: { y: "110%", opacity: 0 },
                show: { y: "0%", opacity: 1, transition: { duration: 0.95, ease: EASE } },
              }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </motion.span>
  );
}

/**
 * Clip-path wipe   the child opens from the bottom edge.
 *
 * The trigger has to live on an outer wrapper: a fully clipped element has no
 * visible area, so IntersectionObserver reports a ratio of 0 for it and the
 * `amount` threshold can never be met. Watching itself, the mask would stay
 * shut forever. The wrapper is unclipped, so it always resolves.
 */
export function MaskReveal({
  children,
  className,
  delay = 0,
  duration = 1.15,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={{ hidden: {}, show: {} }}
    >
      <motion.div
        className={className}
        variants={{
          hidden: { clipPath: "inset(0% 0% 100% 0%)" },
          show: {
            clipPath: "inset(0% 0% 0% 0%)",
            transition: { duration, ease: EASE, delay: delay / 1000 },
          },
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Counts up to `value` once the number is on screen. */
export function Counter({
  value,
  suffix = "",
  duration = 1.8,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, duration, reduced]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

/** Vertical drift tied to scroll progress, smoothed by a spring. */
export function Parallax({
  children,
  intensity = 30,
  className,
}: {
  children: ReactNode;
  intensity?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  // The server has no scroll position, so stay at rest until we are mounted  
  // otherwise the hydrated transform never matches the server-rendered one.
  const [enabled, setEnabled] = useState(false);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const raw = useTransform(scrollYProgress, [0, 1], [intensity, -intensity]);
  const y = useSpring(raw, { stiffness: 120, damping: 30, mass: 0.4 });

  useEffect(() => {
    setEnabled(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y: enabled ? y : 0 }}>{children}</motion.div>
    </div>
  );
}

/** Drifts toward the pointer while hovered   for the round CTAs. */
export function Magnetic({
  children,
  className,
  strength = 0.28,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 180, damping: 22, mass: 0.5 });
  const y = useSpring(my, { stiffness: 180, damping: 22, mass: 0.5 });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x, y }}
      onPointerMove={(e) => {
        if (reduced) return;
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        mx.set((e.clientX - (rect.left + rect.width / 2)) * strength);
        my.set((e.clientY - (rect.top + rect.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
