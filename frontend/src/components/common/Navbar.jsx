import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../store/AuthContext';
import { useDarkMode } from '../../store/DarkModeContext';
import { UserButton, useAuth as useClerkAuth } from '@clerk/react';
import { Menu, X, Shield, LogIn, LogOut, User } from 'lucide-react';
import LanguageDropdown from '../ui/LanguageDropdown';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const clerkAuth = useClerkAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!mobileOpen) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    function handleKey(e) {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [mobileOpen]);

  const { dark, toggleDark } = useDarkMode();



  const navLinks = [
    { path: '/', label: t('nav.home') || 'Home' },
    ...(isAuthenticated
      ? [
          { path: '/get-started', label: t('nav.check_eligibility') || 'Check Eligibility' },
          { path: '/results', label: t('nav.results') || 'Results' },
          { path: '/find-bank', label: t('nav.find_bank') || 'Find Bank' },
        ]
      : []),
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileOpen(false);
  };

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
            <Link
              to="/admin"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/admin'
                  ? 'bg-green-700/10 text-green-700'
                  : 'text-slate-600 hover:text-green-900 hover:bg-gray-100'
              }`}
            >
              {t('nav.admin') || 'Admin'}
            </Link>
          </div>

          {/* Right Controls — condensed */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              className="p-2 rounded-lg text-slate-600 hover:bg-gray-100 transition-colors"
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
                <Link
                  to="/login"
                  className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </Link>
              )
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-gray-100"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div ref={menuRef} className="lg:hidden pb-4 border-t border-gray-100 dark:border-gray-700 animate-slide-down">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-lg text-base font-medium min-h-[44px] flex items-center ${
                  location.pathname === link.path
                    ? 'bg-green-700/10 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : 'text-slate-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-lg text-base font-medium min-h-[44px] flex items-center ${
                location.pathname === '/admin'
                  ? 'bg-green-700/10 text-green-700'
                  : 'text-slate-600 hover:bg-gray-100'
              }`}
            >
              {t('nav.admin') || 'Admin Panel'}
            </Link>
            {/* Clerk UserButton in mobile menu */}
            {clerkAuth?.isSignedIn ? (
              <div className="px-3 py-2">
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-xs text-slate-500">
                    Signed in as {user?.name || user?.mobile}
                    {isAdmin && <span className="ml-2 text-orange-600 font-bold">ADMIN</span>}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-green-700 hover:bg-green-50"
                >
                  Login
                </Link>
              )
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
