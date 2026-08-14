import type { ReactNode } from "react";
import { motion } from "framer-motion";
import heroFallback from "@/assets/hero-agadir.jpg";
import { EASE, Reveal, TextReveal } from "@/components/motion";
import { cn } from "@/lib/utils";

/**
 * One hero for every page: a full-bleed photograph, and the title laid across
 * it. Index pages split their title in two around a gold rule that draws itself
 * once the words have landed (`lead` + `trail`); detail pages, whose titles are
 * a person or a place, pass a single `title` instead.
 *
 * The photograph is what the fixed header rides over while it is still
 * transparent, so a hero without one would leave the bar unreadable   hence the
 * fallback image rather than an optional one.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  trail,
  intro,
  image = heroFallback,
  children,
}: {
  eyebrow: string;
  /** Single-line headline. Detail pages use this; index pages use lead/trail. */
  title?: ReactNode;
  /** First half of a split headline   white. */
  lead?: string;
  /** Second half   gold, as on the homepage. */
  trail?: string;
  intro?: string;
  image?: string;
  children?: ReactNode;
}) {
  const split = Boolean(lead && trail);

  return (
    <section className="relative isolate flex min-h-[82svh] flex-col justify-center overflow-hidden bg-navy text-white">
      {/* Slow settle: the photo lands from a slight zoom instead of popping in. */}
      <motion.img
        src={image}
        alt=""
        aria-hidden
        width={1920}
        height={1280}
        className="absolute inset-0 -z-10 size-full object-cover"
        initial={{ scale: 1.14, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.8, ease: EASE }}
      />
      {/* Readability first: the veil is what keeps the title legible. */}
      <div className="absolute inset-0 -z-10 bg-black/45" aria-hidden />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/25 to-black/55"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-[100rem] px-5 pt-32 pb-16 sm:px-8 sm:pt-40 lg:px-12 lg:pb-20">
        <motion.p
          className="eyebrow flex items-center gap-4"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <span className="h-px w-10 bg-gold" />
          {eyebrow}
        </motion.p>

        {split ? (
          <h1 className="display mt-8 flex items-center gap-5 text-[clamp(2.5rem,8vw,7rem)] leading-[0.95] sm:gap-8 lg:gap-12">
            <span className="shrink-0 text-white">
              <TextReveal text={lead!} delay={120} />
            </span>
            {/* The rule waits for both words, then draws itself across the gap. */}
            <motion.span
              aria-hidden
              className="h-px min-w-6 flex-1 origin-left bg-gold/70"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.1, ease: EASE, delay: 0.75 }}
            />
            <span className="shrink-0 text-gold">
              <TextReveal text={trail!} delay={260} />
            </span>
          </h1>
        ) : (
          <h1 className="display mt-8 max-w-4xl text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.95]">
            {typeof title === "string" ? (
              <TextReveal text={title} delay={120} />
            ) : (
              <motion.span
                className="inline-block"
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.12 }}
              >
                {title}
              </motion.span>
            )}
          </h1>
        )}

        {intro ? (
          <motion.p
            className="mt-8 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}
          >
            {intro}
          </motion.p>
        ) : null}

        {children ? (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.42 }}
          >
            {children}
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}

export function Section({
  children,
  className,
  id,
  tone = "light",
}: {
  children: ReactNode;
  className?: string;
  /** Anchor target   used by the in-page navigation of long pages. */
  id?: string;
  tone?: "light" | "sand" | "navy";
}) {
  return (
    <section
      id={id}
      className={cn(
        "px-5 py-16 sm:px-8 sm:py-24 lg:px-12 lg:py-32",
        tone === "sand" && "bg-sand",
        tone === "navy" && "bg-navy text-white",
        className,
      )}
    >
      <div className="mx-auto max-w-[100rem]">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  action,
  tone = "light",
  className,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  action?: ReactNode;
  tone?: "light" | "navy";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        tone === "navy" && "[&_h2]:text-white",
        className,
      )}
    >
      <div className="max-w-2xl">
        <Reveal>
          <p className="eyebrow flex items-center gap-4">
            <span className="h-px w-8 bg-gold" />
            {eyebrow}
          </p>
        </Reveal>
        <h2 className="display mt-4 text-[clamp(2rem,4.5vw,3.75rem)] leading-[0.98]">
          <TextReveal text={title} delay={80} />
        </h2>
        {intro ? (
          <Reveal delay={160}>
            <p
              className={cn(
                "mt-5 text-base leading-relaxed",
                tone === "navy" ? "text-white/70" : "text-muted-foreground",
              )}
            >
              {intro}
            </p>
          </Reveal>
        ) : null}
      </div>
      {action ? (
        <Reveal delay={240} className="shrink-0">
          {action}
        </Reveal>
      ) : null}
    </div>
  );
}
