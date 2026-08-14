import { useState } from "react";
import { values } from "@/lib/site-data";
import { cn } from "@/lib/utils";

/** House curve, matched to the quartiers panels on the homepage. */
const OPEN = "flex-grow 900ms cubic-bezier(0.16, 1, 0.3, 1)";

/**
 * The four values as a full-bleed band of photographs. At rest every panel is
 * the same width and shows only its title; the hovered   or focused, or
 * tapped   one widens and its sentence unfolds beneath the title. Same gesture
 * as the quartiers band on the homepage, so the two read as one system.
 *
 * The panels are buttons rather than plain divs: the reveal is a disclosure, and
 * a mouse-only version would leave keyboard and touch visitors with four titles
 * and no text.
 */
export function AgencyValues({ className }: { className?: string }) {
  const [active, setActive] = useState(0);

  return (
    <div className={className}>
      {/* Desktop   panels that expand on hover */}
      <div className="hidden h-[32rem] lg:flex xl:h-[36rem]">
        {values.map((value, i) => {
          const isActive = i === active;
          return (
            <button
              key={value.title}
              type="button"
              aria-expanded={isActive}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              className="group relative min-w-0 cursor-default overflow-hidden text-left outline-none"
              style={{
                flexGrow: isActive ? 2.2 : 1,
                flexBasis: 0,
                transition: OPEN,
              }}
            >
              <img
                src={value.image}
                alt=""
                aria-hidden
                loading="lazy"
                width={1280}
                height={960}
                className={cn(
                  "size-full object-cover transition-[transform,filter] duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                  isActive ? "scale-105 saturate-100" : "scale-100 saturate-50",
                )}
              />
              <span
                className={cn(
                  "absolute inset-0 transition-opacity duration-700",
                  isActive ? "bg-gradient-to-t from-navy via-navy/35 to-transparent" : "bg-navy/70",
                )}
              />

              <span className="absolute inset-x-0 bottom-0 block p-7 xl:p-8">
                <span
                  aria-hidden
                  className={cn(
                    "block h-px origin-left bg-gold transition-[width] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                    isActive ? "w-14" : "w-8",
                  )}
                />
                <span className="display mt-5 block text-[1.6rem] text-white xl:text-[1.85rem]">
                  {value.title}
                </span>

                {/* 0fr → 1fr animates a height the browser can interpolate, so the
                    title lifts as the sentence unfolds instead of jumping. */}
                <span
                  className={cn(
                    "grid transition-[grid-template-rows,opacity] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                    isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <span className="overflow-hidden">
                    <span className="mt-4 block max-w-md text-[0.88rem] leading-relaxed text-white/80">
                      {value.text}
                    </span>
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile   snap carousel, both lines always readable */}
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:px-8 lg:hidden [&::-webkit-scrollbar]:hidden">
        {values.map((value) => (
          <article
            key={value.title}
            className="zoom-frame relative h-[26rem] w-[78%] shrink-0 snap-start sm:w-[52%]"
          >
            <img
              src={value.image}
              alt=""
              aria-hidden
              loading="lazy"
              width={1280}
              height={960}
              className="size-full object-cover"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-navy via-navy/45 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <span aria-hidden className="block h-px w-8 bg-gold" />
              <h3 className="display mt-4 text-2xl text-white">{value.title}</h3>
              <p className="mt-3 text-[0.85rem] leading-relaxed text-white/80">{value.text}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
