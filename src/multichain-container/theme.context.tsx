import { createContext, useContext } from 'react';

export enum Theme {
  DARK = 'dark',
  LIGHT = 'light',
}

export type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: Theme.DARK,
  setTheme: (theme) => console.log('no theme provider'),
});
export const useThemeContext = () => useContext(ThemeContext);
