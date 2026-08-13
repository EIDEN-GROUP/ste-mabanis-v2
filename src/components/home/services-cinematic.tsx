import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { EASE, Reveal, TextReveal } from "@/components/motion";
import { images } from "@/lib/site-data";

const services = [
  {
    index: "01",
    title: "Acheter",
    to: "/proprietes" as const,
    search: { transaction: "vente" },
    image: images.property1,
    text: "Une sélection de biens à Agadir et dans le Souss-Massa, choisie pour répondre à chaque projet de vie ou d'investissement.",
  },
  {
    index: "02",
    title: "Vendre",
    to: "/vendre" as const,
    search: undefined,
    image: images.teamOffice,
    text: "Une estimation précise, une présentation exigeante et une stratégie de commercialisation pensée pour valoriser votre bien.",
  },
  {
    index: "03",
    title: "Louer",
    to: "/proprietes" as const,
    search: { transaction: "location" },
    image: images.property2,
    text: "Des propriétés soigneusement sélectionnées et un accompagnement de proximité pour trouver le bien qui vous correspond.",
  },
  // {
  //   index: "04",
  //   title: "Investir",
  //   to: "/services" as const,
  //   search: undefined,
  //   image: images.locationAgadir,
  //   text: "Identifiez les opportunités immobilières les plus pertinentes du Grand Agadir et du littoral atlantique.",
  // },
];

const GRID = "lg:grid lg:grid-cols-[minmax(0,38fr)_minmax(0,44fr)_minmax(0,18fr)] lg:gap-x-8";
const SPRING = { stiffness: 110, damping: 30, mass: 0.4 };

export function CinematicServices() {
  return (
    <section className="bg-ink text-white">
      <div
        className={`mx-auto max-w-[100rem] px-5 pt-20 sm:px-8 pb-16 sm:pt-24 lg:items-start lg:px-12 lg:pt-20 ${GRID}`}
      >
        <Reveal>
          <p className="eyebrow flex items-center gap-4">
            <span className="h-px w-8 bg-gold" />
            Nos services
          </p>
        </Reveal>
        <h2 className="text-[clamp(2.1rem,4.2vw,4.1rem)] leading-[1.06] font-normal tracking-[-0.035em]">
          <span className="block">
            <TextReveal className="p-0!" text="Comment MABANIS" />
          </span>
          <span className="block text-white/40">
            <TextReveal text="vous accompagne" delay={180} />
          </span>
        </h2>
      </div>

      <div className="border-b border-white/10">
        {services.map((service) => (
          <ServiceRow key={service.index} service={service} />
        ))}
      </div>

      <div className="mx-auto max-w-[100rem] px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
        <p className="max-w-3xl text-[clamp(1.5rem,2.8vw,2.5rem)] leading-[1] font-normal tracking-[-0.02em]">
          <TextReveal text="Une équipe qui vous guide à chaque étape de votre projet," />{" "}
          <span className="text-white/40">
            <TextReveal
              text="à Agadir, dans le Souss-Massa et sur le littoral atlantique."
              delay={220}
            />
          </span>
        </p>
        <Reveal delay={260}>
          <Link
            to="/contact"
            className="btn-sheen group mt-10 inline-flex items-center justify-center gap-3 rounded-md border border-white px-7! py-3.5 text-[0.68rem] tracking-[0.18em] font-medium uppercase text-white transition-colors duration-500 hover:bg-gold hover:border-gold hover:text-navy"
          >
            Commencer avec MABANIS
            <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

function ServiceRow({ service }: { service: (typeof services)[number] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [animated, setAnimated] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], [-30, 30]);

  const titleY = useSpring(useTransform(scrollYProgress, [0, 1], [36, -36]), SPRING);
  const arrowX = useSpring(useTransform(scrollYProgress, [0, 0.5, 1], [-26, 0, 14]), SPRING);

  useEffect(() => {
    setAnimated(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <div ref={ref} className="border-t border-white/10">
      <Link
        to={service.to}
        search={service.search as never}
        className="group relative block overflow-hidden outline-none"
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-0 transition-opacity duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
        >
          <motion.img
            src={service.image}
            alt=""
            loading="lazy"
            width={1600}
            height={900}
            className="absolute inset-0 size-full scale-[1.22] object-cover transition-[scale] duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.12]"
            style={{ y: animated ? imageY : 0 }}
          />
          <div className="absolute inset-0 bg-ink/55" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/30 to-ink/70" />
        </div>

        <div
          className={`relative mx-auto flex max-w-[100rem] flex-col gap-y-10 px-5 py-16 sm:px-8 sm:py-20 lg:min-h-[15vh] lg:items-center lg:px-12 lg:py-16 ${GRID}`}
        >
          <div className="flex items-start gap-5 sm:gap-7">
            <Reveal className="shrink-0">
              <span className="grid size-9 place-items-center rounded-full border border-white/30 text-[0.62rem] text-white/80 transition-colors duration-500 group-hover:border-gold group-hover:text-gold">
                {service.index}
              </span>
            </Reveal>
            <Reveal delay={90}>
              <p className="max-w-[17rem] pt-1 text-[1rem] leading-[1.8] text-white/90">
                {service.text}
              </p>
            </Reveal>
          </div>

          <motion.div style={{ y: animated ? titleY : 0 }}>
            <motion.span
              className="relative inline-block pb-2 lg:pb-3"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.4 }}
              variants={{ hidden: {}, show: {} }}
            >
              <span className="block overflow-hidden pb-[0.08em]">
                <motion.span
                  className="block text-[clamp(3.5rem,18vw,9rem)] leading-[0.85] font-normal tracking-[-0.045em] whitespace-nowrap lg:text-[clamp(4rem,10.5vw,10.5rem)]"
                  variants={{
                    hidden: { y: "105%" },
                    show: { y: "0%", transition: { duration: 1.15, ease: EASE } },
                  }}
                >
                  {service.title}
                </motion.span>
              </span>
              <span className="absolute bottom-0 left-[0.03em] h-[5px] w-full origin-left scale-x-0 bg-white transition-[scale] duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100 [@media(hover:none)]:scale-x-100" />
            </motion.span>
          </motion.div>
          <motion.div
            className="self-end lg:self-center lg:justify-self-end"
            style={{ x: animated ? arrowX : 0 }}
          >
            <ArrowRight
              className="size-12 text-white transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3 sm:size-16 lg:size-20 xl:size-24"
              strokeWidth={1}
            />
          </motion.div>
        </div>
      </Link>
    </div>
  );
}
