import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Pencil } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { useAuthModal } from '../../store/AuthModalContext';
import { useMobileMenu } from '../../store/MobileMenuContext';
import { eligibilityTarget, hasProfile } from '../../services/recommender';

/**
 * MobileStickyCta — keeps the page's primary action reachable while scrolling
 * long mobile pages. It floats just above the tab bar and picks the right
 * action for the current route:
 *
 *   /          → Check Your Eligibility (or sign in first)
 *   /results   → Edit Details
 *
 * Form pages (/get-started, /edit-profile) are excluded because they already
 * own a sticky save bar, and stacking the two would overlap.
 */
export default function MobileStickyCta() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { openAuth } = useAuthModal();
  const { menuOpen } = useMobileMenu();

  let cta = null;
  if (pathname === '/') {
    // Same button, two promises: first-timers are told they'll start the form,
    // returning users are told the tap opens their saved matches.
    cta = {
      label: hasProfile(user) ? 'View My Schemes' : 'Check Your Eligibility',
      Icon: ArrowRight,
      run: () => (isAuthenticated ? navigate(eligibilityTarget(user)) : openAuth()),
    };
  } else if (pathname === '/results') {
    cta = { label: 'Edit Details', Icon: Pencil, run: () => navigate('/edit-profile') };
  }

  if (!cta || menuOpen) return null;

  const { label, Icon, run } = cta;

  return (
    <div
      className="fixed inset-x-0 z-40 md:hidden"
      style={{ bottom: 'calc(5.1rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="mx-auto max-w-sm px-3">
        <button
          type="button"
          onClick={run}
          className="tap-spring mi-shine glow-accent flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#138808] px-5 text-sm font-semibold text-white shadow-[0_16px_34px_-14px_rgba(19,136,8,0.75)] transition-shadow duration-300"
        >
          {label}
          <Icon aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
