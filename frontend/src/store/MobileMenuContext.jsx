import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * MobileMenuContext — there is exactly one mobile drawer in the app, mounted
 * once by the shell. The app bar's hamburger and the bottom tab bar's
 * "Settings" tab both open that same instance, so they never drift apart or
 * render two overlapping drawers.
 */
const MobileMenuContext = createContext(null);

export function MobileMenuProvider({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <MobileMenuContext.Provider value={{ menuOpen, openMenu, closeMenu }}>
      {children}
    </MobileMenuContext.Provider>
  );
}

export function useMobileMenu() {
  return useContext(MobileMenuContext) || { menuOpen: false, openMenu: () => {}, closeMenu: () => {} };
}
