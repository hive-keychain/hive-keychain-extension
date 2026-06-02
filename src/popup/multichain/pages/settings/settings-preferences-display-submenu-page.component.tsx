import { Screen } from '@interfaces/screen.interface';
import { RootState } from '@popup/multichain/store';
import { Theme, useThemeContext } from '@popup/theme.context';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { MenuComponent } from 'src/common-ui/menu/menu.component';
import { getSettingsPreferencesDisplayMenuItems } from 'src/popup/multichain/pages/settings/settings-preferences-display-menu-items';

const SettingsPreferencesDisplaySubmenuPage = ({}: PropsFromRedux) => {
  const { theme, toggleTheme } = useThemeContext();

  return (
    <div
      data-testid={`${Screen.SETTINGS_PREFERENCES_AND_DISPLAY}-page`}
      className="settings-preferences-display-submenu-page">
      <MenuComponent
        title="popup_html_preferences_and_display"
        isBackButtonEnable={true}
        menuItems={getSettingsPreferencesDisplayMenuItems({
          theme: theme ?? Theme.LIGHT,
          toggleTheme,
        })}
      />
    </div>
  );
};

const connector = connect((state: RootState) => ({}));

type PropsFromRedux = ConnectedProps<typeof connector>;

export const SettingsPreferencesDisplaySubmenuPageComponent = connector(
  SettingsPreferencesDisplaySubmenuPage,
);
