import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout-bits";
import { EASE } from "@/components/motion";
import { articles, type Article } from "@/lib/site-data";

const VIEWPORT = { once: true, amount: 0.2 } as const;

/** Text and dividers share one entrance: a short rise, staggered by the parent. */
const RISE = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE } },
};

const LINE = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 1.15, ease: EASE } },
};

/** The photograph is uncovered left to right, like a curtain pulled aside. */
const WIPE = {
  hidden: { clipPath: "inset(0% 100% 0% 0%)" },
  show: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 1.25, ease: EASE } },
};

/**
 * Editorial blog list: no cards, no shadows   the house section heading, then
 * full-width rows separated by hairlines, each pairing a dated write-up with a
 * landscape photograph. Content comes from the shared `articles` source, so
 * every row links to a real /actualites/$slug page.
 */
export function BlogSection() {
  const posts = articles.slice(0, 3);

  return (
    <Section tone="sand" className="pt-0! pb-16 sm:pb-20 lg:pb-24">
      <SectionHeading
        eyebrow="Blog & ressources"
        title="Nos analyses et nos actualités."
        intro="Découvrez nos conseils, nos analyses du marché et nos dernières actualités immobilières."
        action={
          <Link
            to="/actualites"
            className="link-underline inline-flex items-center gap-2 text-[0.72rem] tracking-[0.18em] uppercase"
          >
            Voir le blog <ArrowUpRight className="size-4 text-gold" />
          </Link>
        }
      />

      <div className="mt-14 sm:mt-16 lg:mt-20">
        {posts.map((article, i) => (
          <BlogArticle key={article.slug} article={article} index={i} />
        ))}
        {/* Closes the last row so the list reads as a ruled table. */}
        <motion.span
          className="block h-px origin-left bg-foreground/15"
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          variants={LINE}
        />
      </div>
    </Section>
  );
}

function BlogArticle({ article, index }: { article: Article; index: number }) {
  return (
    <motion.article
      className="relative"
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.08, delayChildren: index * 0.04 } },
      }}
    >
      <motion.span
        className="absolute inset-x-0 top-0 h-px origin-left bg-foreground/15"
        variants={LINE}
      />

      <Link
        to="/actualites/$slug"
        params={{ slug: article.slug }}
        className="group flex flex-col gap-6 py-10 sm:gap-8 sm:py-12 lg:grid lg:grid-cols-[minmax(0,42fr)_minmax(0,58fr)] lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-x-10 lg:gap-y-8 lg:py-14 xl:gap-x-16"
      >
        <motion.time
          dateTime={article.iso}
          className="text-[0.74rem] tracking-[0.1em] text-foreground/45 lg:col-start-1 lg:row-start-1"
          variants={RISE}
        >
          {article.iso}
        </motion.time>

        {/* Second in the DOM so phones read date → image → text, as specified.
            `self-start` keeps the letterbox at its own height instead of
            stretching to whatever the text column happens to measure. */}
        <motion.div
          className="overflow-hidden lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start"
          variants={WIPE}
        >
          <motion.img
            src={article.image}
            alt={article.title}
            loading="lazy"
            width={2100}
            height={1000}
            className="aspect-[16/10] w-full object-cover transition-[scale] duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] lg:aspect-[21/10]"
            variants={{
              hidden: { scale: 1.08 },
              show: { scale: 1, transition: { duration: 1.5, ease: EASE } },
            }}
          />
        </motion.div>

        <div className="lg:col-start-1 lg:row-start-2 lg:self-end">
          <motion.h3
            className="max-w-[26rem] text-[clamp(1.45rem,2.3vw,2.1rem)] leading-[1.15] font-medium tracking-[-0.03em] text-foreground transition-opacity duration-500 group-hover:opacity-60"
            variants={RISE}
          >
            {article.title}
          </motion.h3>
          <motion.p
            className="mt-4 max-w-[24rem] text-[0.92rem] leading-[1.75] text-muted-foreground"
            variants={RISE}
          >
            {article.excerpt}
          </motion.p>
          <motion.span
            className="mt-8 inline-flex items-center gap-2.5 rounded-md border border-foreground/20 px-5 py-2.5 text-[0.72rem] tracking-[0.04em] text-foreground transition-colors duration-500 group-hover:border-foreground/70"
            variants={RISE}
          >
            Lire l'article
            <ArrowRight className="size-3.5 transition-transform duration-500 group-hover:translate-x-1" />
          </motion.span>
        </div>
      </Link>
    </motion.article>
  );
}
