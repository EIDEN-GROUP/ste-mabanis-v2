import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Star } from "lucide-react";
import { EASE, Reveal, TextReveal } from "@/components/motion";
import { Section } from "@/components/layout-bits";
import { images, testimonials } from "@/lib/site-data";
import { cn } from "@/lib/utils";

const ROTATE_MS = 7000;
const VIEWPORT = { once: true, amount: 0.2 } as const;

/** Uncovered left to right   the same gesture as the blog photographs. */
const WIPE = {
  hidden: { clipPath: "inset(0% 100% 0% 0%)" },
  show: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 1.25, ease: EASE } },
};

/**
 * Social proof as a single editorial spread: a full-width two-tone heading,
 * then the photograph on the left and the quote on the right, paged by numbered
 * markers. It advances on its own and wraps around, pausing while the visitor
 * is hovering or tabbing through it.
 */
export function TestimonialsSection() {
  const items = testimonials.slice(0, 5);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const active = items[index]!;

  useEffect(() => {
    if (reduced || paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [reduced, paused, items.length]);

  return (
    <Section tone="sand" className="py-16 sm:py-20 lg:py-24">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <h2 className="display max-w-lg text-[clamp(1.9rem,4.5vw,3.75rem)] leading-[0.98]">
          <TextReveal text="Ne nous croyez pas" />{" "}
          <span className="text-foreground/30">
            <TextReveal text="sur parole." delay={180} />
          </span>
        </h2>
        <Reveal delay={240} className="shrink-0">
          <Link
            to="/temoignages"
            className="link-underline inline-flex items-center gap-2 text-[0.72rem] tracking-[0.18em] uppercase"
          >
            Tous les témoignages <ArrowUpRight className="size-4 text-gold" />
          </Link>
        </Reveal>
      </div>

      <div
        className="mt-10 grid gap-8 sm:mt-14 lg:grid-cols-[minmax(0,53fr)_minmax(0,47fr)] lg:gap-14 xl:gap-20"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        {/* One fixed photograph for the whole section   it illustrates the band,
            not any single review, so it stays put while the quotes rotate. The
            scroll trigger sits on the wrapper, never on the clipped box: a fully
            clipped element has no visible area, so IntersectionObserver reports a
            ratio of 0 and the `amount` threshold could never be met. */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          variants={{ hidden: {}, show: {} }}
        >
          <motion.div
            className="relative aspect-[4/3] overflow-hidden rounded-md sm:aspect-[3/2]"
            variants={WIPE}
          >
            <img
              src={images.testimonialsImage}
              alt=""
              aria-hidden
              loading="lazy"
              width={1500}
              height={1000}
              className="absolute inset-0 size-full object-cover"
            />
          </motion.div>
        </motion.div>

        <Reveal delay={140} className="flex flex-col border-t border-foreground/15 pt-7 sm:pt-9">
          <div className="flex items-start justify-between gap-6">
            <ol className="flex flex-wrap items-center gap-2">
              {items.map((t, i) => (
                <li key={t.name}>
                  <button
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Témoignage ${i + 1} sur ${items.length}`}
                    aria-current={i === index}
                    className={cn(
                      "grid size-9 place-items-center rounded-full border text-[0.72rem] transition-colors duration-500",
                      i === index
                        ? "border-navy bg-navy text-white"
                        : "border-foreground/20 text-foreground/50 hover:border-navy hover:text-navy",
                    )}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
            </ol>
            <span
              aria-hidden
              className="quote shrink-0 text-[3.4rem] leading-[0.5] text-navy sm:text-[4.2rem]"
            >
              &rdquo;
            </span>
          </div>

          {/* Reserved height so the block never jumps between quotes of unequal length. */}
          <div className="relative mt-8 min-h-[15rem] sm:min-h-[16rem] lg:min-h-[18rem]">
            <AnimatePresence initial={false} mode="wait">
              <motion.blockquote
                key={active.name}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.55, ease: EASE }}
              >
                <p className="quote text-[1.2rem] leading-[1.5] text-navy sm:text-[1.45rem] lg:text-[1.6rem]">
                  &laquo; {active.quote} &raquo;
                </p>
                <footer className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="text-[0.72rem] tracking-[0.16em] text-navy uppercase">
                    {active.name}
                  </span>
                  <span className="text-foreground/25">/</span>
                  <span className="flex gap-1 text-gold" aria-label="Note : 5 sur 5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className="size-3.5 fill-gold" />
                    ))}
                  </span>
                  <span className="w-full text-[0.78rem] text-muted-foreground sm:w-auto">
                    {active.role} · {active.location}
                  </span>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
