import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../store/AuthContext';
import { useDarkMode } from '../../store/DarkModeContext';
import { UserButton, useAuth as useClerkAuth } from '@clerk/react';
import { Menu, X, Shield, LogIn, LogOut, User } from 'lucide-react';
import LanguageDropdown from '../ui/LanguageDropdown';
import MobileMenu from './MobileMenu';

export default function Navbar({ onAuthOpen }) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const clerkAuth = useClerkAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { dark, toggleDark } = useDarkMode();



  // Public links are always visible so visitors can navigate without signing in.
  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const navLinks = [
    { path: '/', label: t('nav.home') || 'Home' },
    { path: '/get-started', label: t('nav.check_eligibility') || 'Check Eligibility' },
    { path: '/find-bank', label: t('nav.find_bank') || 'Find Bank' },
    ...(isAuthenticated
      ? [{ path: '/results', label: t('nav.results') || 'Results' }]
      : []),
    ...(isAdmin
      ? [{ path: '/admin/dashboard', label: t('nav.admin') || 'Admin' }]
      : []),
  ];

  return (
    <nav className="cs-nav sticky top-0 z-50" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="CreditSetu Home">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-green-700 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="font-bold text-sm sm:text-lg text-green-900 dark:text-green-300 hidden sm:block">
              CreditSetu
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'bg-green-700/10 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : 'text-slate-600 hover:text-green-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-green-300 dark:hover:bg-gray-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Controls — condensed */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              title={dark ? 'Light mode' : 'Dark mode'}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? '☀️' : '🌙'}
            </button>

            <LanguageDropdown compact />

            {/* Clerk UserButton (when signed in via Clerk) */}
            {clerkAuth?.isSignedIn ? (
              <div className="hidden sm:flex items-center">
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              /* Auth controls (custom auth) */
              isAuthenticated ? (
                <div className="hidden sm:flex items-center gap-1.5">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs text-slate-700 dark:text-gray-300 max-w-[80px] truncate">
                      {user?.name || user?.mobile}
                    </span>
                    {isAdmin && (
                      <span className="text-[9px] font-bold text-white bg-orange-500 px-1 py-0.5 rounded">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Logout"
                    aria-label="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onAuthOpen && onAuthOpen()}
                  className="mi-press mi-shine hidden sm:flex items-center gap-1 px-3 py-1.5 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </button>
              )
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/10"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

      </div>

      {/* Single shared mobile drawer for every page */}
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </nav>
  );
}
