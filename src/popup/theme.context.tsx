import { createContext, useContext } from 'react';
import Logger from 'src/utils/logger.utils';

export enum Theme {
  DARK = 'dark',
  LIGHT = 'light',
}

export enum ThemeOpacity {
  dark = '33',
  light = '2b',
}

export type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: Theme.DARK,
  setTheme: (theme) => {
    Logger.log('no theme provider');
  },
});
export const useThemeContext = () => useContext(ThemeContext);
