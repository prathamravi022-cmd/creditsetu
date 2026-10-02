import { useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * PageTransition — slides a route in from the right when the user goes deeper
 * (Home → Details → Results) and back in from the left when they return,
 * mirroring a native navigation stack.
 *
 * Scoped to the routes in DEPTH below; anything else renders untouched. The
 * animation classes themselves only exist inside a `max-width: 767px` media
 * query, so desktop keeps its instant navigation.
 */
const DEPTH = {
  '/': 0,
  '/get-started': 1,
  '/onboarding': 1,
  '/edit-profile': 2,
  '/results': 2,
  '/schemes': 2,
  '/find-schemes': 2,
};

export default function PageTransition({ children }) {
  const { pathname } = useLocation();
  const prevPath = useRef(null);

  // Recomputed once per pathname change, so re-renders can't flip the
  // direction of an in-flight transition.
  const direction = useMemo(() => {
    const from = DEPTH[prevPath.current];
    const to = DEPTH[pathname];
    if (prevPath.current === null || prevPath.current === pathname) return '';
    if (from === undefined || to === undefined) return '';
    return to >= from ? 'page-slide-forward' : 'page-slide-back';
  }, [pathname]);

  useEffect(() => {
    prevPath.current = pathname;
  }, [pathname]);

  // Native apps reset the scroll position on a stack push.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return (
    // Keying on pathname restarts the animation even when two consecutive
    // navigations share the same direction class.
    <div key={pathname} className={direction || undefined}>
      {children}
    </div>
  );
}
