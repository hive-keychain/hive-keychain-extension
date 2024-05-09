import { EvmSettingsMenuItems } from '@popup/evm/pages/home/settings/evm-settings-menu-items';
import { forgetMk } from '@popup/multichain/actions/mk.actions';
import { resetNav } from '@popup/multichain/actions/navigation.actions';
import { RootState } from '@popup/multichain/store';
import { Theme, useThemeContext } from '@popup/theme.context';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { MenuComponent } from 'src/common-ui/menu/menu.component';

const EvmSettings = ({ forgetMk, resetNav }: PropsFromRedux) => {
  const { toggleTheme, theme } = useThemeContext();

  const logout = () => {
    resetNav();
    forgetMk();
  };

  const getThemeIcon = () => {
    theme === Theme.DARK ? SVGIcons.MENU_THEME_LIGHT : SVGIcons.MENU_THEME_DARK;
  };
  return (
    <MenuComponent
      title="popup_html_settings"
      isBackButtonEnable={true}
      rightAction={{
        icon: getThemeIcon(),
        callback: toggleTheme,
        className: 'menu-toggle-theme',
      }}
      isCloseButtonDisabled
      menuItems={EvmSettingsMenuItems(logout)}></MenuComponent>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {
  forgetMk,
  resetNav,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmSettingPage = connector(EvmSettings);
