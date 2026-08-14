import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { images } from "@/lib/site-data";

/**
 * The curtain. It sticks to the top of the viewport for the whole height of the
 * footer, so the dark information block below travels up and closes over it
 * instead of pushing it away   the last scene of the page rather than a banner.
 *
 * Progress is measured over the window between "footer top enters the viewport"
 * and "footer top reaches the viewport top". The element has not pinned yet
 * inside that window, so its position is well defined the whole way through.
 */
export function FooterCTA() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [animated, setAnimated] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start start"] });

  const imageScale = useTransform(scrollYProgress, [0, 1], [1.12, 1]);
  const veil = useTransform(scrollYProgress, [0, 0.55, 1], [0.62, 0.44, 0.4]);
  const contentY = useTransform(scrollYProgress, [0, 1], [64, 0]);
  const contentOpacity = useTransform(scrollYProgress, [0.15, 0.7], [0, 1]);

  useEffect(() => {
    setAnimated(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <div
      ref={ref}
      className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden"
    >
      <motion.img
        src={images.CtaMarina}
        alt=""
        aria-hidden
        loading="lazy"
        width={2400}
        height={1350}
        className="absolute inset-0 size-full object-cover blur-xs"
        style={{ scale: animated ? imageScale : 1  }}
      />
      <motion.div
        className="absolute inset-0 bg-ink"
        style={{ opacity: animated ? veil : 0.5 }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40"
        aria-hidden
      />

      <motion.div
        className="relative mx-auto max-w-4xl px-5 text-center sm:px-8"
        style={{ y: animated ? contentY : 0, opacity: animated ? contentOpacity : 1 }}
      >
        <h2 className="text-[clamp(2rem,4.4vw,4rem)] uppercase leading-[1.06] font-medium tracking-[-0.035em] text-white">
          Votre prochaine adresse
          <span className="block text-white/60">commence ici.</span>
        </h2>
        <p className="mx-auto mt-6 text-[0.95rem] leading-[1.75] text-white/70">
          Agadir, le Souss-Massa et le littoral atlantique nous vous accompagnons jusqu'au bout.
        </p>
        <Link
          to="/contact"
          className="group mt-9 inline-flex items-center gap-3 rounded-md bg-white px-7 py-3.5 text-[0.74rem] font-medium tracking-[0.05em] text-ink transition-[background-color,scale] duration-500 hover:scale-[1.03] hover:bg-gold"
        >
          Parlons de votre projet
          <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1.5" />
        </Link>
      </motion.div>
    </div>
  );
}
