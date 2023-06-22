import { Icons } from '@popup/icons.enum';
import { WitnessVotingSectionComponent } from '@popup/pages/app-container/home/voting-section/witness-voting-section/witness-voting-section.component';
import { RootState } from '@popup/store';
import { Screen } from '@reference-data/screen.enum';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { MenuComponent } from 'src/common-ui/menu/menu.component';
import SettingsMenuItems from './settings-main-page-menu-items';
import './settings-main-page.component.scss';

const SettingsMainPage = ({}: PropsFromRedux) => {
  const goToDiscord = () => {
    chrome.tabs.create({ url: 'https://discord.gg/E6P6Gjv9MC' });
  };
  const goToPeakD = () => {
    chrome.tabs.create({ url: 'https://peakd.com/@keychain' });
  };
  const goToTwitter = () => {
    chrome.tabs.create({ url: 'https://twitter.com/HiveKeychain' });
  };

  return (
    <div
      className="settings-main-page"
      data-testid={`${Screen.SETTINGS_MAIN_PAGE}-page`}>
      <MenuComponent
        title="popup_html_settings"
        isBackButtonEnable={true}
        menuItems={SettingsMenuItems}></MenuComponent>
      <div className="divider"></div>
      <WitnessVotingSectionComponent />
      <div className="link-panel">
        <img
          className="icon"
          src={`/assets/images/${Icons.DISCORD}`}
          onClick={goToDiscord}
        />
        <img
          className="icon"
          src={`/assets/images/${Icons.HIVE}`}
          onClick={goToPeakD}
        />
        <img
          className="icon"
          src={`/assets/images/${Icons.TWITTER}`}
          onClick={goToTwitter}
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const SettingsMainPageComponent = connector(SettingsMainPage);
