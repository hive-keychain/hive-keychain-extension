import { forgetMk } from '@popup/hive/actions/mk.actions';
import { resetNav } from '@popup/hive/actions/navigation.actions';
import { useThemeContext } from '@popup/theme.context';
import { Screen } from '@reference-data/screen.enum';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { MenuComponent } from 'src/common-ui/menu/menu.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { WitnessVotingSectionComponent } from 'src/popup/hive/pages/app-container/home/voting-section/witness-voting-section/witness-voting-section.component';
import { RootState } from 'src/popup/hive/store';
import SettingsMenuItems from './settings-main-page-menu-items';

const SettingsMainPage = ({ forgetMk, resetNav }: PropsFromRedux) => {
  const { toggleTheme } = useThemeContext();

  const goToDiscord = () => {
    chrome.tabs.create({ url: 'https://discord.gg/E6P6Gjv9MC' });
  };
  const goToPeakD = () => {
    chrome.tabs.create({ url: 'https://peakd.com/@keychain' });
  };
  const goToTwitter = () => {
    chrome.tabs.create({ url: 'https://twitter.com/HiveKeychain' });
  };
  const logout = () => {
    resetNav();
    forgetMk();
  };

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
          icon: SVGIcons.MENU_USER_PREFERENCES_THEME,
          callback: toggleTheme,
          className: 'menu-toggle-theme',
        }}
        isCloseButtonDisabled
        menuItems={SettingsMenuItems(logout)}></MenuComponent>
      <WitnessVotingSectionComponent />
      <div className="link-panel">
        <SVGIcon
          className="network-icon"
          icon={SVGIcons.MENU_BOTTOM_BAR_DISCORD}
          onClick={goToDiscord}
          hoverable
        />
        <SVGIcon
          className="network-icon"
          icon={SVGIcons.MENU_BOTTOM_BAR_HIVE}
          onClick={goToPeakD}
          hoverable
        />
        <SVGIcon
          className="network-icon"
          icon={SVGIcons.MENU_BOTTOM_BAR_TWITTER}
          onClick={goToTwitter}
          hoverable
        />
      </div>
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
