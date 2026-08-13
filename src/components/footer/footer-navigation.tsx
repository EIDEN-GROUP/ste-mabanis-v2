import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { EASE } from "@/components/motion";
import { socials } from "@/lib/site-data";

const primary = [
  { to: "/proprietes", search: undefined, hash: undefined, label: "Propriétés" },
  { to: "/proprietes", search: { transaction: "vente" }, hash: undefined, label: "Acheter" },
  { to: "/vendre", search: undefined, hash: undefined, label: "Vendre" },
  { to: "/proprietes", search: { transaction: "location" }, hash: undefined, label: "Louer" },
  { to: "/agence", search: undefined, hash: undefined, label: "À propos" },
  { to: "/agence", search: undefined, hash: "services", label: "Nos services" },
  { to: "/contact", search: undefined, hash: undefined, label: "Contact" },
] as const;

const RISE = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

export function FooterNavigation() {
  return (
    <motion.div
      className="flex flex-col gap-8 sm:flex-row sm:gap-12 lg:gap-16"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
    >
      <nav aria-label="Pied de page" className="min-w-0 flex-1">
        <ul className="space-y-0.5 sm:space-y-1">
          {primary.map((item) => (
            <motion.li key={item.label} variants={RISE}>
              <Link
                to={item.to}
                search={item.search as never}
                {...(item.hash ? { hash: item.hash } : {})}
                className="group inline-flex items-center gap-3 text-[clamp(1.05rem,2.3vw,2.05rem)] leading-[1.3] font-normal tracking-[-0.03em] text-white/45 transition-[color,transform] duration-500 hover:translate-x-2 hover:text-white"
              >
                {item.label}
                <ArrowUpRight className="size-5 -translate-x-2 opacity-0 transition-[opacity,transform] duration-500 group-hover:translate-x-0 group-hover:opacity-100" />
              </Link>
            </motion.li>
          ))}
        </ul>
      </nav>

      <motion.div className="shrink-0" variants={RISE}>
        <p className="text-[0.68rem] tracking-[0.2em] text-white/40 uppercase">Suivez-nous</p>
        {/* Side by side on a phone, stacked once there is a column to stack in. */}
        <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 sm:mt-5 sm:block sm:space-y-2.5">
          {socials.map((social) => (
            <li key={social.label}>
              <a
                href={social.href}
                target="_blank"
                rel="noreferrer noopener"
                className="text-[0.92rem] text-white/50 transition-opacity duration-500 hover:text-white hover:opacity-100"
              >
                {social.label}
              </a>
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
}
