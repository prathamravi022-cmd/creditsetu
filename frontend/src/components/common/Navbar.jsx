import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../store/AuthContext';
import { useDarkMode } from '../../store/DarkModeContext';
import { Menu, X, Shield, Globe, LogIn, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);

  // Close on outside click
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

  // Close on Escape key
  useEffect(() => {
    if (!mobileOpen) return;
    function handleKey(e) {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [mobileOpen]);
  const { dark, toggleDark } = useDarkMode();

  const languages = [
    { code: 'en', label: 'English', flag: 'EN' },
    { code: 'hi', label: 'हिन्दी', flag: 'HI' },
    { code: 'ta', label: 'தமிழ்', flag: 'TA' },
    { code: 'te', label: 'తెలుగు', flag: 'TE' },
    { code: 'bn', label: 'বাংলা', flag: 'BN' },
    { code: 'mr', label: 'मराठी', flag: 'MR' },
    { code: 'kn', label: 'ಕನ್ನಡ', flag: 'KN' },
  ];

  const navLinks = [
    { path: '/', label: 'Home' },
    ...(isAuthenticated
      ? [
          { path: '/get-started', label: 'Check Eligibility' },
          { path: '/results', label: 'Results' },
          { path: '/find-bank', label: 'Find Bank' },
          { path: '/edit-profile', label: 'Edit Profile' },
        ]
      : []),
    { path: '/admin', label: 'Admin Panel' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileOpen(false);
  };

  return (
    <nav className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-green-700 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-green-900 dark:text-green-300 hidden sm:block">
              CreditSetu Scheme Finder
            </span>
          </Link>

          {/* Desktop Nav */}
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

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button onClick={toggleDark} className="p-2 rounded-lg text-slate-600 hover:bg-gray-100 transition-colors" title="Toggle dark mode">{dark ? "☀️" : "🌙"}</button>
            <select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="px-2 py-1.5 rounded-lg text-sm font-medium text-slate-600 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer transition-colors"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>{l.flag}</option>
              ))}
            </select>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-700 max-w-[100px] truncate">
                    {user?.name || user?.mobile}
                  </span>
                  {isAdmin && (
                    <span className="text-[10px] font-bold text-white bg-orange-500 px-1.5 py-0.5 rounded">
                      ADMIN
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-gray-100"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav - Admin always visible */}
        {mobileOpen && (
          <div ref={menuRef} className="lg:hidden pb-4 animate-slide-down">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  location.pathname === link.path
                    ? 'bg-green-700/10 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : 'text-slate-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-green-700 hover:bg-green-50"
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
