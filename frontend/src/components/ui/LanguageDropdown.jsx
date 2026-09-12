import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
];

export default function LanguageDropdown({ compact = false }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const current = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  const select = useCallback((code) => {
    i18n.changeLanguage(code);
    setOpen(false);
    setFocusIndex(-1);
    buttonRef.current?.focus();
  }, [i18n]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && !buttonRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setOpen(true);
        setFocusIndex(LANGUAGES.findIndex(l => l.code === i18n.language));
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusIndex(i => Math.min(i + 1, LANGUAGES.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusIndex >= 0) select(LANGUAGES[focusIndex].code);
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
        break;
      case 'Tab':
        setOpen(false);
        break;
      default:
        break;
    }
  };

  // Focus the active item when menu opens
  useEffect(() => {
    if (open && focusIndex >= 0 && menuRef.current) {
      const items = menuRef.current.querySelectorAll('[role="option"]');
      items[focusIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusIndex, open]);

  if (compact) {
    // Compact mode for navbar — shows just the language code
    return (
      <div className="relative" ref={menuRef}>
        <button
          ref={buttonRef}
          onClick={() => setOpen(!open)}
          onKeyDown={handleKeyDown}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold border border-gray-200 dark:border-gray-600 hover:border-[#138808] hover:bg-[#138808]/5 transition-all text-gray-600 dark:text-gray-300"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label="Select language"
        >
          <Globe className="w-3.5 h-3.5" />
          {current.code.toUpperCase()}
        </button>
        {open && (
          <div
            role="listbox"
            aria-label="Available languages"
            className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-[60] py-1 overflow-hidden"
          >
            {LANGUAGES.map((lang, i) => (
              <button
                key={lang.code}
                role="option"
                aria-selected={lang.code === i18n.language}
                onClick={() => select(lang.code)}
                onMouseEnter={() => setFocusIndex(i)}
                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
                  lang.code === i18n.language
                    ? 'bg-[#138808]/10 text-[#138808] font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                } ${i === focusIndex ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              >
                <span className="font-mono text-xs text-gray-400 w-5">{lang.code.toUpperCase()}</span>
                <span className="flex-1">{lang.native}</span>
                {lang.code === i18n.language && <span className="text-[#138808] text-xs">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Full mode for login page
  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        onKeyDown={handleKeyDown}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white/80 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select language"
      >
        <Globe className="w-4 h-4" />
        <span>{current.native}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          role="listbox"
          aria-label="Available languages"
          className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-[60] py-1 overflow-hidden"
        >
          {LANGUAGES.map((lang, i) => (
            <button
              key={lang.code}
              role="option"
              aria-selected={lang.code === i18n.language}
              onClick={() => select(lang.code)}
              onMouseEnter={() => setFocusIndex(i)}
              className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                lang.code === i18n.language
                  ? 'bg-[#138808]/10 text-[#138808] font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              } ${i === focusIndex ? 'bg-gray-100' : ''}`}
            >
              <span className="font-mono text-xs text-gray-400 w-5">{lang.code.toUpperCase()}</span>
              <span className="flex-1">{lang.native}</span>
              {lang.code === i18n.language && <span className="text-[#138808] text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
