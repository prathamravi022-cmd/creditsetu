import { useRef, useState, useCallback, useEffect } from 'react';

/**
 * Tilt3D — lightweight, dependency-free 3D tilt container.
 *
 * Wraps any content and tilts it in 3D space toward the pointer using
 * CSS perspective transforms. Optionally renders a moving glare highlight
 * and lifts on hover for tactile depth.
 *
 * Performance: all pointer math is throttled to one update per animation
 * frame, transforms are composited (translate3d/rotateX/rotateY), and the
 * effect is fully disabled when the user prefers reduced motion.
 */
export default function Tilt3D({
  children,
  className = '',
  max = 9,            // max tilt in degrees
  lift = 8,           // px of translateZ lift while hovered
  scale = 1.015,      // hover scale
  glare = true,       // moving light sheen
  glareColor = 'rgba(255,255,255,0.45)',
  perspective = 900,
  as: Tag = 'div',
  style,
  ...rest
}) {
  const ref = useRef(null);
  const frame = useRef(0);
  const reduced = useRef(false);
  const [t, setT] = useState({ rx: 0, ry: 0, gx: 50, gy: 50, active: false });

  useEffect(() => {
    reduced.current =
      typeof window !== 'undefined' &&
      !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    return () => cancelAnimationFrame(frame.current);
  }, []);

  const onPointerMove = useCallback((e) => {
    if (reduced.current) return;
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      setT({
        rx: (0.5 - py) * max * 2,
        ry: (px - 0.5) * max * 2,
        gx: px * 100,
        gy: py * 100,
        active: true,
      });
    });
  }, [max]);

  const onPointerLeave = useCallback(() => {
    cancelAnimationFrame(frame.current);
    setT({ rx: 0, ry: 0, gx: 50, gy: 50, active: false });
  }, []);

  const transform = t.active
    ? `perspective(${perspective}px) rotateX(${t.rx.toFixed(2)}deg) rotateY(${t.ry.toFixed(2)}deg) translateZ(${lift}px) scale(${scale})`
    : `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) translateZ(0) scale(1)`;

  return (
    <Tag
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerEnter={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={`tilt3d ${t.active ? 'is-tilting' : ''} ${className}`}
      style={{
        transform,
        transformStyle: 'preserve-3d',
        transition: t.active
          ? 'transform 0.08s linear'
          : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform',
        ...style,
      }}
      {...rest}
    >
      {children}
      {glare && (
        <span
          aria-hidden="true"
          className="tilt3d__glare"
          style={{
            opacity: t.active ? 1 : 0,
            background: `radial-gradient(circle at ${t.gx}% ${t.gy}%, ${glareColor}, transparent 55%)`,
          }}
        />
      )}
    </Tag>
  );
}
