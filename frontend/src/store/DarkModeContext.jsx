import React, { createContext, useContext, useState, useEffect } from 'react';
const DarkModeContext = createContext();
export function DarkModeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('creditsetu_dark');
    return saved === 'true';
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
