import React, { useRef, useState, useEffect, useCallback } from 'react';

/** Delivers a vertical layout scale (through hover translateY) so long-form
 *  content panels stay on the baseline while the hero card rotates.
 */
export default function useIsomorphicScale(ref) {
  const [scale, setScale] = useState(1);
  const raf = useRef(0);
  useEffect(() => {
    const el = ref && ref.current;
    if (!el || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const progress = (r.top + r.height / 2) / (window.innerHeight || 1) - 0.5;
      const s = Math.max(0.98, Math.min(1, 1 + progress * 0.12));
      setScale(s);
      if (!raf.current) raf.current = requestAnimationFrame(onScroll);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('scroll', onScroll);
    };
  }, [ref]);
  return scale;
}
