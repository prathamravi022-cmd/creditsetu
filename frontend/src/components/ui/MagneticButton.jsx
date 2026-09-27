import { useRef, useState, useCallback, useEffect } from 'react';

/**
 * MagneticButton — button that magnetically follows the pointer within a
 * radius, ripples on press, and springs back on release.
 *
 * Keeps the native <button> semantics (keyboard focus, Enter/Space, ARIA)
 * and simply animates a translation on the inner label. Disabled for
 * reduced-motion users, where it behaves like a normal button.
 */
export default function MagneticButton({
  children,
  className = '',
  strength = 0.35,     // how far the button drifts toward the pointer (0–1)
  ripple = true,
  as: Tag = 'button',
  onClick,
  style,
  ...rest
}) {
  const ref = useRef(null);
  const frame = useRef(0);
  const reduced = useRef(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [pressed, setPressed] = useState(false);
  const [ripples, setRipples] = useState([]);

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
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      setOffset({ x: dx * strength, y: dy * strength });
    });
  }, [strength]);

  const reset = useCallback(() => {
    cancelAnimationFrame(frame.current);
    setOffset({ x: 0, y: 0 });
  }, []);

  const handleClick = useCallback((e) => {
    if (ripple && !reduced.current) {
      const el = ref.current;
      if (el) {
        const r = el.getBoundingClientRect();
        const id = Date.now() + Math.random();
        setRipples((rs) => [
          ...rs,
          { id, x: e.clientX - r.left, y: e.clientY - r.top, size: Math.max(r.width, r.height) * 1.6 },
        ]);
        window.setTimeout(() => setRipples((rs) => rs.filter((x) => x.id !== id)), 650);
      }
    }
    onClick?.(e);
  }, [onClick, ripple]);

  return (
    <Tag
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onBlur={reset}
      onClick={handleClick}
      className={`magnetic-btn ${className}`}
      style={{
        transform: `translate3d(${offset.x.toFixed(1)}px, ${offset.y.toFixed(1)}px, 0) scale(${pressed ? 0.96 : 1})`,
        transition: offset.x || offset.y
          ? 'transform 0.12s ease-out'
          : 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform',
        ...style,
      }}
      {...rest}
    >
      {children}
      {ripple && (
        <span className="magnetic-btn__ripples" aria-hidden="true">
          {ripples.map((r) => (
            <span
              key={r.id}
              className="magnetic-btn__ripple"
              style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
            />
          ))}
        </span>
      )}
    </Tag>
  );
}
