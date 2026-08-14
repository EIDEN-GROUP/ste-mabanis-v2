import { type FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { EASE } from "@/components/motion";
import { agency } from "@/lib/site-data";

const RISE = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
};

/**
 * Newsletter line and coordinates. The e-mail field is a ruled editorial line
 * rather than a boxed input   the underline is the only chrome it gets.
 */
export function FooterContact() {
  const onSubscribe = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    // No mailing backend yet   swap this for the real subscribe call when it exists.
    toast.success("Merci, votre adresse est bien notée.", {
      description: "Vous recevrez notre sélection de biens d'Agadir une fois par mois.",
    });
    form.reset();
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
    >
      <motion.form onSubmit={onSubscribe} className="group max-w-xl" variants={RISE}>
        <label
          htmlFor="footer-newsletter"
          className="text-[0.68rem] tracking-[0.2em] text-white/40 uppercase"
        >
          Newsletter
        </label>
        <div className="relative mt-4 flex items-center sm:mt-5">
          <input
            id="footer-newsletter"
            type="email"
            required
            placeholder="Votre adresse e-mail"
            className="w-full bg-transparent pr-12 pb-4 text-[1.05rem] text-white placeholder:text-white/35 focus:outline-none sm:text-[1.25rem]"
          />
          <button
            type="submit"
            aria-label="S'inscrire à la newsletter"
            className="absolute right-0 bottom-4 text-white/60 transition-[color,transform] duration-500 hover:translate-x-1 hover:text-gold"
          >
            <ArrowRight className="size-5" />
          </button>
          <span className="absolute inset-x-0 bottom-0 h-px bg-white/20" />
          {/* Fills in from the left while the line is focused or hovered. */}
          <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-white transition-[scale] duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 group-focus-within:scale-x-100" />
        </div>
      </motion.form>

      {/* Two rows on a phone, one on tablets up   three stacked blocks would
          cost the screen its last row. */}
      <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 sm:mt-14 sm:grid-cols-3 sm:gap-8">
        <motion.div className="col-span-2 sm:col-span-1" variants={RISE}>
          <dt className="text-[0.68rem] tracking-[0.2em] text-white/40 uppercase">Agence</dt>
          <dd className="mt-3 text-[0.95rem] leading-[1.6] text-white/90 sm:mt-4 sm:text-[0.98rem]">
            Agadir · Souss-Massa
            <span className="block text-white/50">Maroc</span>
          </dd>
        </motion.div>

        <motion.div variants={RISE}>
          <dt className="text-[0.68rem] tracking-[0.2em] text-white/40 uppercase">Email</dt>
          <dd className="mt-3 sm:mt-4">
            <a
              href={`mailto:${agency.email}`}
              className="link-underline text-[0.95rem] break-all text-white/90 transition-colors duration-500 hover:text-gold sm:text-[0.98rem]"
            >
              {agency.email}
            </a>
          </dd>
        </motion.div>

        <motion.div variants={RISE}>
          <dt className="text-[0.68rem] tracking-[0.2em] text-white/40 uppercase">Téléphone</dt>
          <dd className="mt-3 sm:mt-4">
            <a
              href={`tel:${agency.mobile.replace(/\s/g, "")}`}
              className="link-underline text-[0.95rem] text-white/90 transition-colors duration-500 hover:text-gold sm:text-[0.98rem]"
            >
              {agency.mobile}
            </a>
          </dd>
        </motion.div>
      </dl>
    </motion.div>
  );
}
