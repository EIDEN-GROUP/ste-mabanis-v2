import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import alOmraneLogo from "@/assets/logos/al-omrane.svg";
import avitoImmoLogo from "@/assets/logos/avito-immo.svg";
import cgiLogo from "@/assets/logos/cgi.svg";
import mubawabLogo from "@/assets/logos/mubawab.svg";
import saroutyLogo from "@/assets/logos/sarouty.svg";
import yakeeyLogo from "@/assets/logos/yakeey.svg";

type Partner = {
  name: string;
  logoSrc: string;
};

/** Drop a real .svg / .png / .webp in `src/assets/logos/` and swap the import above. */
const partners: Partner[] = [
  { name: "Mubawab", logoSrc: mubawabLogo },
  { name: "Avito Immo", logoSrc: avitoImmoLogo },
  { name: "Sarouty", logoSrc: saroutyLogo },
  { name: "CGI", logoSrc: cgiLogo },
  { name: "Al Omrane", logoSrc: alOmraneLogo },
  { name: "Yakeey", logoSrc: yakeeyLogo },
];

const AUTOPLAY_DELAY = 2600;

export function TrustStrip({ className }: { className?: string }) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [isPaused, setIsPaused] = React.useState(false);

  React.useEffect(() => {
    if (!api || isPaused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => api.scrollNext(), AUTOPLAY_DELAY);
    return () => window.clearInterval(timer);
  }, [api, isPaused]);

  const pause = () => setIsPaused(true);
  const resume = () => setIsPaused(false);

  return (
    <section
      className={cn(
        "flex h-[var(--trust-strip-h,4.5rem)] items-center gap-3 bg-white/95 px-4 shadow-[0_18px_44px_rgba(8,31,51,0.22)] backdrop-blur-sm sm:gap-6 sm:px-7",
        className,
      )}
      aria-label="Partenaires de confiance"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocusCapture={pause}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) resume();
      }}
      onPointerDown={pause}
      onPointerUp={resume}
    >
      <p className="w-20 shrink-0 text-[0.58rem] leading-snug font-semibold tracking-[0.03em] text-navy sm:w-28 sm:text-[0.68rem]">
        Ils nous font confiance
      </p>

      <span className="hidden h-8 w-px shrink-0 bg-line sm:block" aria-hidden="true" />

      <Carousel
        setApi={setApi}
        opts={{ align: "start", loop: true }}
        className="min-w-0 flex-1 [mask-image:linear-gradient(90deg,transparent,#000_20px,#000_calc(100%-20px),transparent)]"
      >
        <CarouselContent className="-ml-2 sm:-ml-4">
          {partners.map((partner) => (
            <CarouselItem
              key={partner.name}
              className="basis-full pl-2 sm:basis-1/3 sm:pl-4 lg:basis-1/4 xl:basis-1/5"
            >
              <div className="flex h-10 items-center justify-center px-1">
                <img
                  src={partner.logoSrc}
                  alt={partner.name}
                  decoding="async"
                  className="h-6 w-auto max-w-full object-contain opacity-70 grayscale transition duration-500 hover:opacity-100 hover:grayscale-0 sm:h-8"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <span className="hidden h-8 w-px shrink-0 bg-line sm:block" aria-hidden="true" />

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={() => api?.scrollPrev()}
          className="grid size-7 place-items-center rounded-md border border-line text-navy/50 transition-colors hover:border-navy hover:bg-sand hover:text-navy focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none sm:size-8"
          aria-label="Partenaire précédent"
        >
          <ChevronLeft className="size-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => api?.scrollNext()}
          className="grid size-7 place-items-center rounded-md border border-line text-navy/50 transition-colors hover:border-navy hover:bg-sand hover:text-navy focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none sm:size-8"
          aria-label="Partenaire suivant"
        >
          <ChevronRight className="size-3.5" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
