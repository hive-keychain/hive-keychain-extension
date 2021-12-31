import { WitnessVotingSectionComponent } from '@popup/pages/app-container/home/voting-section/witness-voting-section/witness-voting-section.component';
import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { MenuComponent } from 'src/common-ui/menu/menu.component';
import SettingsMenuItems from './settings-main-page-menu-items';
import './settings-main-page.component.scss';

const SettingsMainPage = ({ shouldDisplayWitnessVoting }: PropsFromRedux) => {
  return (
    <div className="settings-main-page">
      <MenuComponent
        title="popup_html_settings"
        isBackButtonEnable={true}
        menuItems={SettingsMenuItems}></MenuComponent>
      {shouldDisplayWitnessVoting && <WitnessVotingSectionComponent />}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    shouldDisplayWitnessVoting:
      state.activeAccount.account.proxy.length === 0 &&
      !state.activeAccount.account.witness_votes.includes('stoodkev'),
  };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const SettingsMainPageComponent = connector(SettingsMainPage);
