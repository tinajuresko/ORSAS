import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeContextProvider = ({ children }) => {
  // Read from localStorage or default to false
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('isDark');
    return savedTheme !== null ? JSON.parse(savedTheme) : false;
  });

  // Effect to set initial theme based on prefers-color-scheme if no localStorage preference is found
  useEffect(() => {
    if (localStorage.getItem('isDark') === null) {
      const isBrowserThemeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(isBrowserThemeDark);
    }
  }, []);

  // Effect to apply the theme and save to localStorage
  useEffect(() => {
    document.body.className = isDark ? 'dark' : 'light';
    localStorage.setItem('isDark', JSON.stringify(isDark));
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);
  const setLightTheme = () => setIsDark(false);
  const setDarkTheme = () => setIsDark(true);

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark, toggleTheme, setLightTheme, setDarkTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
