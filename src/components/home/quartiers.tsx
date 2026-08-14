import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MapPin } from "lucide-react";
import { locations } from "@/lib/site-data";
import { cn } from "@/lib/utils";

/**
 * Desktop: panels that expand on hover, so the five secteurs of the Grand Agadir
 * fit in a single screen. Mobile: a snap carousel of the same cards.
 */
export function QuartiersShowcase() {
  const [active, setActive] = useState(0);

  return (
    <>
      {/* Desktop   expanding panels */}
      <div className="hidden h-[32rem] gap-2 lg:flex xl:h-[36rem]">
        {locations.map((l, i) => {
          const isActive = i === active;
          return (
            <Link
              key={l.slug}
              to="/quartiers/$slug"
              params={{ slug: l.slug }}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              aria-label={`Découvrir ${l.name}`}
              className="group relative rounded-md min-w-0 overflow-hidden outline-none"
              style={{
                flexGrow: isActive ? 3.6 : 1,
                flexBasis: 0,
                transition: "flex-grow 900ms cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <img
                src={l.image}
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
              <div
                className={cn(
                  "absolute inset-0 transition-opacity duration-700",
                  isActive ? "bg-gradient-to-t from-navy via-navy/35 to-transparent" : "bg-navy/70",
                )}
              />

              {/* Collapsed state   vertical name */}
              <span
                className={cn(
                  "absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 pb-8 transition-opacity duration-500",
                  isActive ? "pointer-events-none opacity-0" : "opacity-100 delay-200",
                )}
              >
                <span className="display text-lg whitespace-nowrap text-white [writing-mode:vertical-rl] [text-orientation:mixed]">
                  {l.name}
                </span>
                <span className="h-8 w-px bg-gold" />
              </span>

              {/* Expanded state */}
              <span
                className={cn(
                  "absolute inset-x-0 bottom-0 block p-8 transition-[opacity,transform] duration-700",
                  isActive
                    ? "translate-y-0 opacity-100 delay-150"
                    : "pointer-events-none translate-y-5 opacity-0",
                )}
              >
                <span className="flex items-center gap-2 text-[0.62rem] tracking-[0.24em] text-gold uppercase">
                  <MapPin className="size-3.5" />
                  {l.city}
                </span>
                <span className="display mt-3 block text-4xl text-white">{l.name}</span>
                <span className="mt-3 block max-w-md text-sm leading-relaxed text-white/70">
                  {l.intro}
                </span>
                <span className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/20 pt-5">
                  <span className="text-sm tracking-[0.12em] text-gold-soft">{l.priceRange}</span>
                  <span className="inline-flex items-center gap-2 text-[0.65rem] tracking-[0.2em] text-white uppercase">
                    Explorer
                    <ArrowUpRight className="size-4 text-gold transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </span>
                </span>
              </span>
            </Link>
          );
        })}
      </div>

      {/* Mobile   snap carousel */}
      <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:px-8 lg:hidden [&::-webkit-scrollbar]:hidden">
        {locations.map((l) => (
          <Link
            key={l.slug}
            to="/quartiers/$slug"
            params={{ slug: l.slug }}
            className="zoom-frame group rounded-md relative block h-[24rem] w-[78%] shrink-0 snap-start sm:w-[52%]"
          >
            <img
              src={l.image}
              alt=""
              aria-hidden
              loading="lazy"
              width={1280}
              height={960}
              className="size-full object-cover"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-navy via-navy/35 to-transparent" />
            <span className="absolute inset-x-0 bottom-0 block p-6">
              <span className="display block text-2xl text-white">{l.name}</span>
              <span className="mt-2 block text-xs tracking-[0.16em] text-gold uppercase">
                {l.priceRange}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
