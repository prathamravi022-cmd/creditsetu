import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

const EASE = [0.16, 1, 0.3, 1];

/**
 * Reveal — scroll-triggered entrance with a subtle 3D rise.
 *
 * Elements lift from below, rotate a few degrees forward and scale up as
 * they enter the viewport. Honors prefers-reduced-motion by fading only.
 */
export function Reveal({
  children,
  className = '',
  delay = 0,
  y = 28,
  rotateX = 7,
  once = true,
  amount = 0.2,
  duration = 0.62,
  as = 'div',
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount, once });
  const reduce = useReducedMotion();
  const MotionTag = motion[as] || motion.div;

  const hidden = reduce
    ? { opacity: 0 }
    : { opacity: 0, y, rotateX, transformPerspective: 900 };
  const shown = reduce
    ? { opacity: 1 }
    : { opacity: 1, y: 0, rotateX: 0, transformPerspective: 900 };

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial={hidden}
      animate={inView ? shown : hidden}
      transition={{ duration, delay, ease: EASE }}
      style={{ transformOrigin: 'center bottom' }}
    >
      {children}
    </MotionTag>
  );
}

/**
 * RevealGroup — staggers direct <RevealItem> children as the group enters view.
 */
export function RevealGroup({
  children,
  className = '',
  stagger = 0.09,
  delay = 0,
  once = true,
  amount = 0.15,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount, once });
  const reduce = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: reduce ? 0 : stagger, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** RevealItem — a single staggered child inside a RevealGroup. */
export function RevealItem({ children, className = '', y = 26, rotateX = 7, duration = 0.6 }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={{
        hidden: reduce ? { opacity: 0 } : { opacity: 0, y, rotateX, transformPerspective: 900 },
        show: reduce
          ? { opacity: 1, transition: { duration } }
          : { opacity: 1, y: 0, rotateX: 0, transition: { duration, ease: EASE } },
      }}
      style={{ transformOrigin: 'center bottom' }}
    >
      {children}
    </motion.div>
  );
}

export default Reveal;
