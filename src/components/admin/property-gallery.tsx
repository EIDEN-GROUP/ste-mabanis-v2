import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PropertyMedia } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

/**
 * Swipeable gallery. On touch it is a native scroll-snap carousel   no JS drag
 * handling, so momentum and rubber-banding stay native. Arrows appear from `sm`
 * where a pointer is likely.
 */
export function PropertyGallery({
  media,
  className,
}: {
  media: PropertyMedia[];
  className?: string;
}) {
  const photos = media.filter((m) => m.kind === "photo").sort((a, b) => a.position - b.position);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  // Track the active slide from scroll position rather than driving it.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setActive(Math.round(el.scrollLeft / el.clientWidth));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const go = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  if (!photos.length) {
    return (
      <div
        className={cn(
          "grid aspect-[4/3] place-items-center rounded-md border border-line bg-sand",
          className,
        )}
      >
        <p className="text-sm text-muted-foreground">Aucune photo</p>
      </div>
    );
  }

  return (
    <div className={cn("group relative", className)}>
      <div
        ref={trackRef}
        className="flex aspect-[4/3] snap-x snap-mandatory overflow-x-auto rounded-md [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {photos.map((m) => (
          <div key={m.id} className="relative w-full shrink-0 snap-center bg-sand">
            <img
              src={m.url}
              alt={m.label ?? ""}
              width={1280}
              height={960}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      {photos.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() => go(Math.max(0, active - 1))}
            disabled={active === 0}
            aria-label="Photo précédente"
            className="absolute top-1/2 left-3 hidden size-10 -translate-y-1/2 place-items-center rounded-md bg-admin-surface/90 text-navy opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100 disabled:pointer-events-none disabled:opacity-0 sm:grid"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => go(Math.min(photos.length - 1, active + 1))}
            disabled={active === photos.length - 1}
            aria-label="Photo suivante"
            className="absolute top-1/2 right-3 hidden size-10 -translate-y-1/2 place-items-center rounded-md bg-admin-surface/90 text-navy opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100 disabled:pointer-events-none disabled:opacity-0 sm:grid"
          >
            <ChevronRight className="size-4" />
          </button>

          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {photos.map((m, i) => (
              <button
                key={m.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Aller à la photo ${i + 1}`}
                aria-current={i === active}
                className={cn(
                  "h-1 rounded-sm transition-all duration-400",
                  i === active ? "w-6 bg-gold" : "w-2 bg-white/70",
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
