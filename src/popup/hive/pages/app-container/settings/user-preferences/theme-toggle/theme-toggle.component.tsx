import { Theme, useThemeContext } from '@popup/theme.context';
import React from 'react';
import { NewIcons } from 'src/common-ui/icons.enum';
import SwitchComponent from 'src/common-ui/switch/switch.component';

export const ThemeToggle = () => {
  const { theme, setTheme } = useThemeContext();

  return (
    <SwitchComponent
      onChange={(value) => setTheme(value)}
      selectedValue={theme}
      leftValue={Theme.DARK}
      rightValue={Theme.LIGHT}
      leftValueIcon={NewIcons.THEME_LIGHT_MODE}
      rightValueIcon={NewIcons.THEME_DARK_MODE}
    />
  );
};
