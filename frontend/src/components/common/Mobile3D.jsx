import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Mobile3D — one shared driver for the scroll-linked 3D layer.
 *
 * On small screens only, it:
 *   • tags the sticky app bar with `.is-scrolled` once the page moves, so
 *     the bar visibly lifts above the content it floats over;
 *   • drives every `[data-scroll3d]` element's perspective tilt from a
 *     single rAF-throttled scroll loop, so there is one listener and one
 *     layout pass no matter how many tilted elements are on the page.
 *
 * Layout positions come from `offsetTop` (which transforms do not affect)
 * and are re-read on resize, so the scroll loop only *writes* CSS custom
 * properties — no forced reflow per frame. Inert on desktop and fully
 * disabled for reduced-motion users.
 */
export default function Mobile3D() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const mobile = window.matchMedia('(max-width: 767px)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!mobile.matches || reduce.matches) return undefined;

    let items = [];
    let nav = null;
    let raf = 0;
    let vh = window.innerHeight;

    // Sum of offsetTop up the offsetParent chain — layout position only,
    // unaffected by the transforms we apply.
    const docOffset = (el) => {
      let y = 0;
      let node = el;
      while (node) {
        y += node.offsetTop;
        node = node.offsetParent;
      }
      return y;
    };

    const collect = () => {
      items = Array.from(document.querySelectorAll('[data-scroll3d]')).map((el) => {
        el.classList.add('is-3d-active');
        return {
          el,
          amp: parseFloat(el.getAttribute('data-scroll3d')) || 6,
          top: docOffset(el),
          h: el.offsetHeight,
        };
      });
    };

    const measure = () => {
      vh = window.innerHeight;
      items = items.map((it) => ({ ...it, top: docOffset(it.el), h: it.el.offsetHeight }));
    };

    const update = () => {
      raf = 0;
      // Resolve lazily: on lazy routes the app bar mounts after this effect,
      // and it is re-rendered per route, so never cache a stale node.
      if (!nav || !nav.isConnected) nav = document.querySelector('.cs-nav');
      const sy = window.scrollY || window.pageYOffset || 0;
      const half = vh / 2;
      for (let i = 0; i < items.length; i += 1) {
        const it = items[i];
        const span = half + it.h / 2;
        if (!span) continue;
        // +1 just entering from the bottom, 0 at centre, -1 leaving the top.
        let p = (it.top + it.h / 2 - sy - half) / span;
        if (p < -1) p = -1;
        else if (p > 1) p = 1;
        const st = it.el.style;
        st.setProperty('--cs3d-rx', `${(p * it.amp).toFixed(2)}deg`);
        st.setProperty('--cs3d-ty', `${(p * -12).toFixed(1)}px`);
        st.setProperty('--cs3d-s', (1 - Math.abs(p) * 0.018).toFixed(3));
      }
      if (nav) nav.classList.toggle('is-scrolled', sy > 8);
    };

    const schedule = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };

    const onResize = () => {
      measure();
      schedule();
    };

    // Lazy routes mount their tilted panels after this effect runs, so
    // re-collect whenever the set of tagged elements changes.
    const observer = new MutationObserver(() => {
      if (document.querySelectorAll('[data-scroll3d]').length !== items.length) {
        collect();
        schedule();
      }
    });

    collect();
    update();

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', onResize);
      observer.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
      if (nav) nav.classList.remove('is-scrolled');
      for (let i = 0; i < items.length; i += 1) {
        const el = items[i].el;
        el.classList.remove('is-3d-active');
        el.style.removeProperty('--cs3d-rx');
        el.style.removeProperty('--cs3d-ty');
        el.style.removeProperty('--cs3d-s');
      }
    };
  }, [pathname]);

  return null;
}
