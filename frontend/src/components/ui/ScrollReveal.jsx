import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/**
 * ScrollReveal — wraps children with scroll-triggered fade+scale animation.
 * Extracted from React Bits AnimatedList's useInView pattern.
 * Each child animates in when 30% visible, with configurable stagger delay.
 */
export default function ScrollReveal({
  children,
  delay = 0,
  className = '',
  once = true,
  amount = 0.3,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount, once });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 24, scale: 0.96 }}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
