import React, { createContext, useState, useMemo } from 'react';
import { StyleSheet } from 'react-native';

// Define your light and dark theme colors here
const lightThemeColors = {
  background: '#f9fafb', // Lighter gray
  card: '#ffffff',
  text: '#1f2937', // Dark gray
  textSecondary: '#6b7280', // Medium gray
  primary: '#ff6f00',
  primaryLight: '#ffad75',
  border: '#e5e7eb', // Light border
  input: '#f9fafb',
};

const darkThemeColors = {
  background: '#121212',
  card: '#1e1e1e',
  text: '#f9fafb', // Almost white
  textSecondary: '#b0b0b0', // Lighter gray
  primary: '#ff6f00',
  primaryLight: '#ffad75',
  border: '#272727',
  input: '#333',
};

export const ThemeContext = createContext({
  isDarkMode: false,
  theme: lightThemeColors,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const theme = useMemo(() => (isDarkMode ? darkThemeColors : lightThemeColors), [isDarkMode]);

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};