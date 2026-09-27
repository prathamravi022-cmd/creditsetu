import { useReducedMotion } from 'framer-motion';

/**
 * Marquee — seamless infinite horizontal scroller for logos, badges or
 * testimonials. Uses a duplicated track and a single CSS keyframe
 * (translateX -50%) so it stays GPU-composited and cheap.
 *
 * Pauses on hover/focus, reverses direction via `reverse`, and degrades to
 * a static, scrollable row for reduced-motion users.
 */
export default function Marquee({
  children,
  className = '',
  speed = 38,          // seconds for one full loop
  reverse = false,
  pauseOnHover = true,
  gap = '2.5rem',
  fade = true,
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className={`marquee overflow-x-auto ${className}`} style={{ gap }}>
        <div className="flex shrink-0" style={{ gap }}>{children}</div>
      </div>
    );
  }

  const track = (
    <div className="marquee__track" style={{ gap, animationDuration: `${speed}s`, animationDirection: reverse ? 'reverse' : 'normal' }}>
      {children}
      <span aria-hidden="true" style={{ display: 'contents' }}>{children}</span>
    </div>
  );

  return (
    <div className={`marquee ${pauseOnHover ? 'marquee--pause' : ''} ${fade ? 'marquee--fade' : ''} ${className}`}>
      {track}
    </div>
  );
}
