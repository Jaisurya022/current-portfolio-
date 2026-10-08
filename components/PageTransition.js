import { motion } from "motion/react";

const ease = [0.76, 0, 0.24, 1];

// A marigold curtain rises over the old page, then lifts off the new one.
// Plain value objects (no variant labels) so the transition never propagates
// into scroll-triggered animations inside the page.
export default function PageTransition({ children }) {
  return (
    <div>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[70] bg-marigold"
        initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
        animate={{ clipPath: "inset(0% 0% 100% 0%)", transition: { duration: 0.65, ease, delay: 0.05 } }}
        exit={{
          clipPath: ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"],
          transition: { duration: 0.5, ease },
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease, delay: 0.3 } }}
        exit={{ opacity: 0, y: -16, transition: { duration: 0.35, ease } }}
      >
        {children}
      </motion.div>
    </div>
  );
}
