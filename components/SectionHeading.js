import { useRef } from "react";
import { motion, useInView } from "motion/react";

// Section titles slide up out of a mask when they enter the viewport.
// The observer watches the <h2> (the mask), not the hidden span inside it —
// a fully clipped element never reports as intersecting.
export default function SectionHeading({ id, children, sub }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  return (
    <div className="mb-10 sm:mb-16">
      <h2 ref={ref} id={id} className="overflow-hidden text-[clamp(2.4rem,6vw,4.5rem)] font-bold">
        <motion.span
          className="block"
          initial={{ y: "105%" }}
          animate={{ y: inView ? "0%" : "105%" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.span>
      </h2>
      {sub && <p className="mt-3 max-w-xl text-base text-mist sm:mt-4 sm:text-lg">{sub}</p>}
    </div>
  );
}
