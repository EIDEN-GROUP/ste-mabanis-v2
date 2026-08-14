import { motion } from "framer-motion";
import { EASE } from "@/components/motion";

/**
 * The wordmark as a graphic element: outlined type, no fill, sized in viewport
 * units so it runs nearly edge to edge. It climbs its full height out of a mask
 * on arrival   the trigger sits on the unclipped wrapper, because a child
 * translated fully below an overflow-hidden box never intersects the viewport
 * and so could never trigger itself.
 */
export function FooterBrand() {
  return (
    <motion.div
      className="select-none"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      variants={{ hidden: {}, show: {} }}
      aria-hidden
    >
      <span className="block overflow-hidden pb-[0.06em]">
        <motion.span
          className="display block text-center text-[21.5vw] leading-[0.78] tracking-[-0.045em] text-transparent [-webkit-text-stroke:1.5px_#fff] sm:[-webkit-text-stroke:2px_#fff] lg:[-webkit-text-stroke:2.5px_#fff]"
          variants={{
            hidden: { y: "100%" },
            show: { y: "0%", transition: { duration: 1.6, ease: EASE } },
          }}
        >
          MABANIS
        </motion.span>
      </span>
    </motion.div>
  );
}
