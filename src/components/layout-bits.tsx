import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { EASE, Reveal, TextReveal } from "@/components/motion";
import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  intro,
  image,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: string;
  image?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-navy pt-32 pb-16 text-white sm:pt-40 sm:pb-24">
      {image ? (
        <>
          {/* Slow settle: the photo lands from a slight zoom instead of popping in. */}
          <motion.img
            src={image}
            alt=""
            aria-hidden
            width={1280}
            height={960}
            className="absolute inset-0 h-full w-full object-cover opacity-25"
            initial={{ scale: 1.14, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.25 }}
            transition={{ duration: 1.8, ease: EASE }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/80 to-navy/60" />
        </>
      ) : null}

      <div className="relative mx-auto max-w-[100rem] px-5 sm:px-8 lg:px-12">
        <motion.p
          className="eyebrow flex items-center gap-4"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <span className="h-px w-8 bg-gold" />
          {eyebrow}
        </motion.p>

        <h1 className="display mt-5 max-w-4xl text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.95]">
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

        {intro ? (
          <motion.p
            className="mt-6 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg"
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
  tone = "light",
}: {
  children: ReactNode;
  className?: string;
  tone?: "light" | "sand" | "navy";
}) {
  return (
    <section
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
