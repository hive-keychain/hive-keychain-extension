import { Screen } from '@reference-data/screen.enum';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { NewIcons } from 'src/common-ui/icons.enum';
import { MenuComponent } from 'src/common-ui/menu/menu.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { WitnessVotingSectionComponent } from 'src/popup/hive/pages/app-container/home/voting-section/witness-voting-section/witness-voting-section.component';
import { RootState } from 'src/popup/hive/store';
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
      <div className="love-text">
        {chrome.i18n.getMessage('html_popup_made_with_love_by_stoodkev')}
      </div>
      <MenuComponent
        title="popup_html_settings"
        isBackButtonEnable={true}
        menuItems={SettingsMenuItems}></MenuComponent>
      <WitnessVotingSectionComponent />
      {/* <div className="divider"></div> */}
      <div className="link-panel">
        <SVGIcon
          className="network-icon"
          icon={NewIcons.DISCORD}
          onClick={goToDiscord}
        />
        <SVGIcon
          className="network-icon"
          icon={NewIcons.HIVE}
          onClick={goToPeakD}
        />
        <SVGIcon
          className="network-icon"
          icon={NewIcons.TWITTER}
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
