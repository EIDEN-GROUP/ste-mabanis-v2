import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion";
import { agents } from "@/lib/site-data";
import { cn } from "@/lib/utils";

/** Below this the pointer counts as a drag, and the card's link is suppressed. */
const DRAG_SLOP = 5;

/**
 * The conseillers as a horizontal rail you drag through, with a progress bar
 * that tracks the travel. The bar only appears when the rail actually overflows
 *   with four cards on a wide screen there is nothing to scroll, and a full-width
 * bar going nowhere would be a lie.
 *
 * Portraits are optional: until an agent has one, the card carries the monogram
 * the rest of the site uses for them.
 */
export function AgencyTeam({ className }: { className?: string }) {
  const rail = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [ratio, setRatio] = useState(1);
  const [travel, setTravel] = useState(0);
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: false });

  const measure = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    const distance = el.scrollWidth - el.clientWidth;
    setTravel(distance);
    setRatio(el.scrollWidth ? el.clientWidth / el.scrollWidth : 1);
    setProgress(distance > 0 ? el.scrollLeft / distance : 0);
  }, []);

  useEffect(() => {
    measure();
    const el = rail.current;
    if (!el) return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  const onPointerDown = (e: React.PointerEvent) => {
    // Let touch keep the platform's own momentum scrolling.
    if (e.pointerType === "touch" || !rail.current) return;
    drag.current = {
      active: true,
      startX: e.clientX,
      startLeft: rail.current.scrollLeft,
      moved: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const state = drag.current;
    if (!state.active || !rail.current) return;
    const dx = e.clientX - state.startX;
    if (!state.moved && Math.abs(dx) < DRAG_SLOP) return;
    state.moved = true;
    rail.current.scrollLeft = state.startLeft - dx;
  };

  const endDrag = () => {
    drag.current.active = false;
  };

  // A rail that overruns by a few pixels is not something to drag; ignore it so
  // the bar only shows up when there is real travel.
  const scrollable = travel > 32;

  return (
    <div className={className}>
      <div
        ref={rail}
        onScroll={measure}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        className={cn(
          "flex gap-5 overflow-x-auto px-5 pb-2 sm:px-8 lg:px-12 [&::-webkit-scrollbar]:hidden",
          scrollable && "cursor-grab active:cursor-grabbing",
        )}
      >
        {agents.map((agent, i) => (
          <Reveal
            key={agent.slug}
            delay={i * 80}
            className="w-[68vw] shrink-0 sm:w-[17rem] lg:w-[19rem] xl:w-[20rem]"
          >
            <Link
              to="/equipe/$slug"
              params={{ slug: agent.slug }}
              // A drag that ends on a card should scroll it, not open it.
              onClick={(e) => {
                if (drag.current.moved) e.preventDefault();
              }}
              className="group block"
            >
              <div className="zoom-frame relative aspect-4/5 rounded-md bg-sand">
                {agent.photo ? (
                  <img
                    src={agent.photo}
                    alt={agent.name}
                    loading="lazy"
                    width={800}
                    height={1000}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="display grid size-full place-items-center text-[3.5rem] text-navy/25 transition-colors duration-700 group-hover:text-gold">
                    {agent.initials}
                  </span>
                )}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-navy/0 transition-colors duration-700 group-hover:bg-navy/10"
                />
              </div>

              <div className="mt-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="display text-xl transition-colors duration-500 group-hover:text-navy sm:text-2xl">
                    {agent.name}
                  </h3>
                  <p className="mt-1.5 text-[0.66rem] leading-relaxed tracking-[0.14em] text-muted-foreground uppercase">
                    {agent.role}
                  </p>
                </div>
                <ArrowUpRight className="mt-1 size-4 shrink-0 text-gold transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
            </Link>
          </Reveal>
        ))}
      </div>

      {scrollable ? (
        <div className="mx-auto mt-10 max-w-[100rem] px-5 sm:px-8 lg:px-12">
          <div className="relative h-px w-full bg-line" aria-hidden>
            <span
              className="absolute inset-y-0 block bg-navy"
              style={{
                width: `${ratio * 100}%`,
                // The thumb travels the leftover track, so it lands flush at both ends.
                left: `${progress * (1 - ratio) * 100}%`,
                height: 2,
                top: -0.5,
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
