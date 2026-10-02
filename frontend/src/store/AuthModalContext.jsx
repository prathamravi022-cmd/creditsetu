import { createContext, useContext, useState, useCallback } from 'react';

/**
 * AuthModalContext — lets any surface (hero CTA, navbar, drawer) ask for the
 * login modal without prop-drilling through the router, and guarantees the
 * modal is actually mounted somewhere in the tree.
 */
const AuthModalContext = createContext(null);

export function AuthModalProvider({ children }) {
  const [authOpen, setAuthOpen] = useState(false);
  const openAuth = useCallback(() => setAuthOpen(true), []);
  const closeAuth = useCallback(() => setAuthOpen(false), []);

  return (
    <AuthModalContext.Provider value={{ authOpen, openAuth, closeAuth }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  return useContext(AuthModalContext) || { authOpen: false, openAuth: () => {}, closeAuth: () => {} };
}
