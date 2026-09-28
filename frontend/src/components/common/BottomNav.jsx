import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, UserCog, Settings } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { useMobileMenu } from '../../store/MobileMenuContext';
import { eligibilityTarget } from '../../services/recommender';

/**
 * BottomNav — the floating mobile tab bar that replaces top navigation below
 * 768px. Home / Schemes / Profile are real destinations; Settings opens the
 * shared drawer, which already owns theme, language, help and logout.
 *
 * The active tab gets a soft brand glow. Each tab is at least 56px tall so it
 * clears the 44px minimum touch target with room to spare.
 */
export default function BottomNav() {
  const { user } = useAuth();
  const { openMenu } = useMobileMenu();
  const { pathname } = useLocation();

  const schemesTarget = eligibilityTarget(user);

  const items = [
    {
      key: 'home',
      label: 'Home',
      Icon: Home,
      to: '/',
      active: pathname === '/',
    },
    {
      key: 'schemes',
      label: 'Schemes',
      Icon: FileText,
      to: schemesTarget,
      // Both halves of the eligibility flow count as "Schemes" so the tab stays
      // lit while the user fills the form and while they read their matches.
      active: ['/results', '/schemes', '/find-schemes', '/get-started', '/onboarding'].includes(pathname),
    },
    {
      key: 'profile',
      label: 'Profile',
      Icon: UserCog,
      to: '/edit-profile',
      active: pathname === '/edit-profile',
    },
  ];

  const tabClass =
    'tap-spring relative flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5';

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 md:hidden"
      aria-label="Primary"
      style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="mx-auto flex max-w-sm items-stretch gap-1 rounded-2xl border border-gray-200/80 bg-white/90 px-1.5 py-1 shadow-[0_18px_44px_-18px_rgba(15,36,64,0.5)] backdrop-blur-xl dark:border-white/10 dark:bg-[#1b1b1d]/92 dark:shadow-[0_18px_44px_-18px_rgba(0,0,0,0.9)]">
        {items.map(({ key, label, Icon, to, active }) => (
          <Link
            key={key}
            to={to}
            className={tabClass}
            aria-current={active ? 'page' : undefined}
            aria-label={label}
          >
            {active && (
              <span
                aria-hidden="true"
                className="absolute inset-x-1.5 inset-y-0.5 rounded-xl bg-[#138808]/10 shadow-[0_0_20px_-4px_rgba(19,136,8,0.6)] dark:bg-[#34d399]/15 dark:shadow-[0_0_20px_-4px_rgba(52,211,153,0.55)]"
              />
            )}
            <Icon
              aria-hidden="true"
              className={
                'relative h-5 w-5 transition-all duration-300 ' +
                (active
                  ? 'scale-110 text-[#138808] drop-shadow-[0_0_8px_rgba(19,136,8,0.45)] dark:text-[#34d399] dark:drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                  : 'text-slate-500 dark:text-slate-400')
              }
            />
            <span
              className={
                'relative text-[10px] font-semibold leading-none transition-colors ' +
                (active ? 'text-[#138808] dark:text-[#34d399]' : 'text-slate-500 dark:text-slate-400')
              }
            >
              {label}
            </span>
          </Link>
        ))}

        <button
          type="button"
          onClick={openMenu}
          className={tabClass + ' text-slate-500 dark:text-slate-400'}
          aria-label="Settings"
        >
          <Settings aria-hidden="true" className="h-5 w-5" />
          <span className="text-[10px] font-semibold leading-none">Settings</span>
        </button>
      </div>
    </nav>
  );
}
