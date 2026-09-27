import { useEffect, useRef, useState } from 'react';

/**
 * Parallax — translates its children vertically as the element scrolls
 * through the viewport, creating depth for hero imagery and backdrops.
 *
 * Reads scroll position inside a single requestAnimationFrame tick (no
 * layout thrash) and disables itself for reduced-motion users.
 *
 * @param speed  positive = moves slower than scroll (background depth),
 *               negative = moves faster (foreground lift).
 * @param scale  optional starting scale, easing to 1 as it enters view.
 */
export default function Parallax({
  children,
  className = '',
  speed = 0.25,
  scale = 1,
  as: Tag = 'div',
  style,
  ...rest
}) {
  const ref = useRef(null);
  const raf = useRef(0);
  const [y, setY] = useState(0);
  const [visible, setVisible] = useState(false);

  // Compose a subtle continuous rotation on top of scroll-based parallax so
  // the card stays alive without fighting the scroll transform. Disabled under
  // prefers-reduced-motion.
  const rotRef = useRef(0);
  const rafRot = useRef(0);
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      // one slow rotation per ~9s
      rotRef.current = (rotRef.current + dt * (Math.PI * 2) / 9) % (Math.PI * 2);
      rafRot.current = requestAnimationFrame(tick);
    };
    rafRot.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRot.current);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    const update = () => {
      raf.current = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 0;
      // progress: -1 (below viewport) → 1 (above viewport)
      const progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
      setY(-progress * speed * 120);
      if (rect.top < vh * 0.85) setVisible(true);
    };

    const onScroll = () => {
      if (!raf.current) raf.current = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [speed]);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
      transform: `translate3d(0, ${y.toFixed(1)}px, 0) scale(${visible ? 1 : scale}) rotate(${rotRef.current.toFixed(2)}rad)`,
      transition: 'transform 0.15s linear, transform 0.25s ease-out',
      willChange: 'transform',
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
