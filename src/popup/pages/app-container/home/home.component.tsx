import {ActionsSectionComponent} from '@popup/pages/app-container/home/actions-section/actions-section.component';
import {ResourcesSectionComponent} from '@popup/pages/app-container/home/resources-section/resources-section.component';
import {SelectAccountSectionComponent} from '@popup/pages/app-container/home/select-account-section/select-account-section.component';
import {TopBarComponent} from '@popup/pages/app-container/home/top-bar/top-bar.component';
import {WalletInfoSectionComponent} from '@popup/pages/app-container/home/wallet-info-section/wallet-info-section.component';
import {RootState} from '@popup/store';
import React from 'react';
import {connect, ConnectedProps} from 'react-redux';
import './home.component.css';

const Home = ({}: PropsFromRedux) => {
  return (
    <div className="home-page">
      <TopBarComponent />
      <SelectAccountSectionComponent />
      <ResourcesSectionComponent />
      <WalletInfoSectionComponent />
      <ActionsSectionComponent />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const HomeComponent = connector(Home);
