import { useRef } from "react";
import { motion, useInView } from "motion/react";

// Animates from `from` to `to` the first time the element scrolls into view.
// (Uses useInView + animate rather than whileInView so it also works on pages
// entered through the AnimatePresence route transition.)
export default function Reveal({ as = "div", from, to, transition, margin = "-10% 0px", children, ...rest }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin });
  const Tag = motion[as];
  return (
    <Tag ref={ref} initial={from} animate={inView ? to : from} transition={transition} {...rest}>
      {children}
    </Tag>
  );
}
