import { createContext, useContext, useState, useEffect } from 'react';
const DarkModeContext = createContext();
export function DarkModeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    // Light is the default experience; only an explicit user choice turns on dark.
    // Matches the pre-paint script in index.html so there is no flash.
    return localStorage.getItem('creditsetu_dark') === 'true';
  });
  useEffect(() => {
    localStorage.setItem('creditsetu_dark', dark);
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);
  return (
    <DarkModeContext.Provider value={{ dark, toggleDark: () => setDark(d => !d) }}>
      {children}
    </DarkModeContext.Provider>
  );
}
export const useDarkMode = () => useContext(DarkModeContext);
