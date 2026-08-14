import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Plus } from "lucide-react";
import { EASE, Reveal, TextReveal } from "@/components/motion";
import { services } from "@/lib/site-data";
import { cn } from "@/lib/utils";

/** Same column rhythm as the homepage services band, so the two read as one family. */
const SHELL = "mx-auto max-w-[100rem] px-5 sm:px-8 lg:px-12";

/**
 * The seven métiers, folded into one cinematic band on the dark ground the
 * homepage uses for its services. One row is open at a time: seven expanded
 * lists of commitments would be a wall of text, and the fold keeps the eye on
 * the titles   the same gesture as the homepage rows, at a scale that survives
 * seven of them.
 */
export function AgencyServices() {
  const [open, setOpen] = useState<string | null>(services[0]!.slug);

  // `scroll-mt`: the header is fixed, so every scroller   native fragment jump,
  // router, Lenis   has to stop short of it.
  return (
    <section id="services" className="scroll-mt-[5.5rem] bg-ink text-white">
      <div className={cn(SHELL, "pt-20 pb-14 sm:pt-24 sm:pb-16 lg:pt-28 lg:pb-20")}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,38fr)_minmax(0,62fr)] lg:items-end lg:gap-12">
          <Reveal>
            <p className="eyebrow flex items-center gap-4">
              <span className="h-px w-8 bg-gold" />
              Nos services
            </p>
          </Reveal>
          <div>
            <h2 className="text-[clamp(2.1rem,4.2vw,4.1rem)] leading-[1.06] font-normal tracking-[-0.035em]">
              <span className="block">
                <TextReveal className="p-0!" text="Sept métiers," />
              </span>
              <span className="block text-white/40">
                <TextReveal text="un seul interlocuteur." delay={180} />
              </span>
            </h2>
            <Reveal delay={240}>
              <p className="mt-6 max-w-xl text-[0.95rem] leading-[1.8] text-white/60">
                Nous n'externalisons ni l'estimation, ni la commercialisation, ni la gestion. C'est
                plus exigeant, et c'est la seule façon de tenir nos engagements.
              </p>
            </Reveal>
          </div>
        </div>
      </div>

      <div className="border-b border-white/10">
        {services.map((service, i) => (
          <ServiceRow
            key={service.slug}
            service={service}
            index={i}
            isOpen={open === service.slug}
            onToggle={() => setOpen((current) => (current === service.slug ? null : service.slug))}
          />
        ))}
      </div>

      <div className={cn(SHELL, "py-16 sm:py-20 lg:py-24")}>
        <p className="max-w-3xl text-[clamp(1.4rem,2.6vw,2.3rem)] leading-[1.1] font-normal tracking-[-0.02em]">
          <TextReveal text="Un conseiller référent par dossier," />{" "}
          <span className="text-white/40">
            <TextReveal text="du premier appel à la dixième année." delay={220} />
          </span>
        </p>
        <Reveal delay={260}>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              to="/vendre"
              className="btn-sheen group inline-flex items-center justify-center gap-3 rounded-md bg-gold px-7 py-3.5 text-[0.68rem] font-medium tracking-[0.18em] text-navy uppercase transition-colors duration-500 hover:bg-white"
            >
              Estimer mon bien
              <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/contact"
              className="btn-sheen group inline-flex items-center justify-center gap-3 rounded-md border border-white/40 px-7 py-3.5 text-[0.68rem] font-medium tracking-[0.18em] text-white uppercase transition-colors duration-500 hover:border-gold hover:bg-gold hover:text-navy"
            >
              Parler à un conseiller
              <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ServiceRow({
  service,
  index,
  isOpen,
  onToggle,
}: {
  service: (typeof services)[number];
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const panelId = `service-panel-${service.slug}`;

  // `overflow-hidden`: the backdrop rests at scale 1.18, and unclipped it would
  // widen the document and hand the page a horizontal scrollbar.
  return (
    <div className="group relative overflow-hidden border-t border-white/10">
      {/* The photograph lives behind the whole row, header and panel alike: open
          or hovered, it fades up under the text instead of pushing it around. */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 transition-opacity duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
          isOpen
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
        )}
      >
        <img
          src={service.image}
          alt=""
          loading="lazy"
          width={1600}
          height={900}
          className={cn(
            "absolute inset-0 size-full object-cover transition-[scale] duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
            isOpen ? "scale-[1.06]" : "scale-[1.18] group-hover:scale-[1.1]",
          )}
        />
        <div className="absolute inset-0 bg-ink/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/60 to-ink/85" />
      </div>

      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className={cn(
            SHELL,
            "relative flex w-full items-center gap-5 py-7 text-left outline-none sm:gap-8 sm:py-9",
          )}
        >
          <span
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-full border text-[0.62rem] transition-colors duration-500",
              isOpen
                ? "border-gold text-gold"
                : "border-white/30 text-white/80 group-hover:border-gold group-hover:text-gold",
            )}
          >
            {String(index + 1).padStart(2, "0")}
          </span>

          <span className="relative min-w-0 flex-1">
            <span
              className={cn(
                "display block text-[clamp(1.5rem,4.4vw,3.1rem)] transition-colors duration-500",
                isOpen ? "text-gold" : "text-white",
              )}
            >
              {service.title}
            </span>
            <span
              aria-hidden
              className={cn(
                "absolute -bottom-1.5 left-0 block h-px w-full origin-left bg-gold transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                isOpen ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
              )}
            />
          </span>

          <span
            className={cn(
              "grid size-11 shrink-0 place-items-center rounded-full border transition-colors duration-500 sm:size-12",
              isOpen ? "border-gold bg-gold text-navy" : "border-white/25 text-white",
            )}
          >
            <Plus
              className={cn(
                "size-5 transition-transform duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                isOpen && "rotate-45",
              )}
              strokeWidth={1.25}
            />
          </span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            id={panelId}
            key="panel"
            className="relative overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.75, ease: EASE }}
          >
            <div className={cn(SHELL, "pb-10 sm:pb-14")}>
              <div className="grid gap-8 border-t border-white/10 pt-8 sm:pl-14 lg:grid-cols-[minmax(0,38fr)_minmax(0,62fr)] lg:gap-14">
                <p className="max-w-md text-[0.98rem] leading-[1.8] text-white/85">
                  {service.summary}
                </p>
                <ul className="grid gap-x-10 gap-y-3.5 sm:grid-cols-2">
                  {service.points.map((point, i) => (
                    <motion.li
                      key={point}
                      className="flex items-start gap-3 text-[0.92rem] leading-relaxed text-white/70"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, ease: EASE, delay: 0.12 + i * 0.07 }}
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={1.5} />
                      {point}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
