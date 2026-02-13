import { Screen } from '@interfaces/screen.interface';
import { forgetMk } from '@popup/multichain/actions/mk.actions';
import { resetNav } from '@popup/multichain/actions/navigation.actions';
import { RootState } from '@popup/multichain/store';
import { Theme, useThemeContext } from '@popup/theme.context';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { MenuComponent } from 'src/common-ui/menu/menu.component';
import Config from 'src/config';
import { WitnessVotingSectionComponent } from 'src/popup/hive/pages/app-container/home/voting-section/witness-voting-section/witness-voting-section.component';
import SettingsMenuItems from './settings-main-page-menu-items';

const SettingsMainPage = ({ forgetMk, resetNav }: PropsFromRedux) => {
  const { toggleTheme, theme } = useThemeContext();

  const goToDiscord = () => {
    chrome.tabs.create({ url: Config.social.discord });
  };
  const goToPeakD = () => {
    chrome.tabs.create({ url: Config.social.peakd });
  };
  const goToTwitter = () => {
    chrome.tabs.create({ url: Config.social.twitter });
  };
  const goToMedium = () => {
    chrome.tabs.create({ url: Config.social.medium });
  };
  const logout = () => {
    resetNav();
    forgetMk();
  };
  const getIcon = () =>
    theme === Theme.DARK ? SVGIcons.MENU_THEME_LIGHT : SVGIcons.MENU_THEME_DARK;
  return (
    <div
      className="settings-main-page"
      data-testid={`${Screen.SETTINGS_MAIN_PAGE}-page`}>
      {/* <div className="love-text">
        {chrome.i18n.getMessage('html_popup_made_with_love_by_stoodkev')}
      </div> */}
      <MenuComponent
        title="popup_html_settings"
        isBackButtonEnable={true}
        rightAction={{
          icon: getIcon(),
          callback: toggleTheme,
          className: 'menu-toggle-theme',
        }}
        showDetachWindowOption
        isCloseButtonDisabled
        menuItems={SettingsMenuItems(logout)}></MenuComponent>
      <WitnessVotingSectionComponent />
    </div>
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

export const SettingsMainPageComponent = connector(SettingsMainPage);
