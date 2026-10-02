import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home, FileText, Landmark, UserCog, LifeBuoy, Settings as SettingsIcon,
  LogIn, LogOut, Shield, X, Moon, Sun, Phone, MessageSquareWarning, ScrollText, Lock,
} from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { useDarkMode } from '../../store/DarkModeContext';
import ThemeToggle from '../ui/ThemeToggle';
import { eligibilityTarget } from '../../services/recommender';

const LANGUAGES = [
  { code: 'en', native: 'English' },
  { code: 'hi', native: 'हिन्दी' },
  { code: 'ta', native: 'தமிழ்' },
  { code: 'te', native: 'తెలుగు' },
  { code: 'bn', native: 'বাংলা' },
  { code: 'mr', native: 'मराठी' },
  { code: 'kn', native: 'ಕನ್ನಡ' },
];

const itemCls =
  'flex items-center gap-3 w-full px-3.5 py-3 min-h-[48px] rounded-xl text-sm font-medium transition-all duration-200 ' +
  'text-slate-700 dark:text-slate-200 hover:bg-[#138808]/8 dark:hover:bg-[#138808]/15 hover:translate-x-0.5';

function Icon({ as: As }) {
  return (
    <span className="w-9 h-9 shrink-0 rounded-xl bg-[#138808]/10 text-[#138808] flex items-center justify-center">
      <As className="w-4 h-4" />
    </span>
  );
}

export default function MobileMenu({ open, onClose }) {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { dark } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();
  const panelRef = useRef(null);

  const isLanding = location.pathname === '/';

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const go = (path) => { onClose(); navigate(path); };

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  const initials = (user?.name || user?.email || user?.mobile || 'Guest')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const landingLinks = [
    { href: '#how-it-works', label: t('landing.nav.how_it_works') || 'How It Works' },
    { href: '#schemes', label: t('landing.nav.schemes') || 'Schemes' },
    { href: '#faq', label: 'FAQ' },
    { href: '#contact', label: t('landing.nav.contact') || 'Contact' },
  ];

  const drawer = (
    <div
      className={`fixed inset-0 z-[80] lg:hidden transition-all duration-300 ${open ? '' : 'pointer-events-none invisible'}`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-[#0a1017]/50 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`absolute top-0 right-0 h-full w-80 max-w-[86vw] flex flex-col bg-white dark:bg-[#0b1220] border-l border-gray-100 dark:border-white/10 shadow-2xl transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#138808] flex items-center justify-center">
              <Landmark className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-[#000080] dark:text-white font-bold leading-tight">CreditSetu</span>
              <span className="text-gray-400 text-[9px] uppercase tracking-wider">Scheme Finder</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl grid place-items-center text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5">
          {/* User card */}
          <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-3.5">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-full bg-[#138808] text-white font-bold grid place-items-center text-sm shrink-0">
                {initials}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                  {isAuthenticated ? (user?.name || user?.email || user?.mobile) : 'Guest user'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {isAuthenticated ? (user?.email || user?.mobile || 'Signed in') : 'Sign in for personalised results'}
                </div>
              </div>
              {isAdmin && (
                <span className="ml-auto text-[9px] font-bold text-white bg-orange-500 px-1.5 py-0.5 rounded shrink-0">ADMIN</span>
              )}
            </div>
          </div>

          {/* Main navigation */}
          <nav className="space-y-1" aria-label="Sections">
            <Link to="/" onClick={onClose} className={itemCls}><Icon as={Home} /> Home</Link>
            <Link to={eligibilityTarget(user)} onClick={onClose} className={itemCls}><Icon as={FileText} /> {t('nav.results') || 'My Schemes'}</Link>
            <Link to="/find-bank" onClick={onClose} className={itemCls}><Icon as={Landmark} /> {t('nav.find_bank') || 'Find a Bank'}</Link>
            <button type="button" onClick={() => go('/edit-profile')} className={`${itemCls} text-left`}>
              <Icon as={UserCog} /> Edit Details
            </button>
          </nav>

          {/* Landing section shortcuts */}
          {isLanding && (
            <div className="space-y-1 pt-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">On this page</p>
              {landingLinks.map((l) => (
                <a key={l.href} href={l.href} onClick={onClose} className={itemCls}>
                  <span className="w-9 h-9 shrink-0 grid place-items-center text-slate-400">
                    <ScrollText className="w-4 h-4" />
                  </span>
                  {l.label}
                </a>
              ))}
            </div>
          )}

          {/* Settings */}
          <div className="pt-1">
            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <SettingsIcon className="w-3 h-3" /> Settings
            </p>
            <div className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl">
              <span className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                <Icon as={dark ? Moon : Sun} /> {dark ? 'Dark mode' : 'Light mode'}
              </span>
              <ThemeToggle />
            </div>
            <div className="px-3.5 pt-2.5">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">{t('onboarding.step1.language') || 'Preferred Language'}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {LANGUAGES.map((lang) => {
                  const active = (i18n.language || 'en').startsWith(lang.code);
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => i18n.changeLanguage(lang.code)}
                      aria-pressed={active}
                      className={`px-2.5 py-2 rounded-lg text-xs font-medium border transition-colors ${
                        active
                          ? 'border-[#138808] bg-[#138808]/10 text-[#138808]'
                          : 'border-gray-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-[#138808]/50'
                      }`}
                    >
                      {lang.native}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Help & support */}
          <div className="pt-1">
            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <LifeBuoy className="w-3 h-3" /> Help &amp; Support
            </p>
            <a href={`tel:${'1800-11-0031'}`} className={itemCls}>
              <Icon as={Phone} /> Toll-free: 1800-11-0031
            </a>
            <Link to="/feedback" onClick={onClose} className={itemCls}><Icon as={MessageSquareWarning} /> Feedback / Grievance</Link>
            <Link to="/privacy-policy" onClick={onClose} className={itemCls}><Icon as={Lock} /> Privacy Policy</Link>
            <Link to="/terms" onClick={onClose} className={itemCls}><Icon as={Shield} /> Terms of Use</Link>
            <Link to="/#faq" onClick={onClose} className={itemCls}><Icon as={LifeBuoy} /> FAQ</Link>
          </div>
        </div>

        {/* Footer action */}
        <div className="p-3.5 border-t border-gray-100 dark:border-white/10">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] rounded-xl text-sm font-semibold text-red-600 border border-red-200 dark:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          ) : (
            <button
              type="button"
              onClick={() => go(eligibilityTarget(user))}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] rounded-xl text-sm font-semibold text-white bg-[#138808] hover:bg-[#0f6d06] transition-colors shadow-md"
            >
              <LogIn className="w-4 h-4" /> Get Started
            </button>
          )}
        </div>
      </aside>
    </div>
  );

  // Rendered in a portal: the navbar uses backdrop-filter, which would otherwise
  // become the containing block and squash a fixed-position drawer to navbar size.
  if (typeof document === 'undefined') return null;
  return createPortal(drawer, document.body);
}
