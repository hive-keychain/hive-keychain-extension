import { loadActiveAccount } from '@popup/actions/active-account.actions';
import { ActionsSectionComponent } from '@popup/pages/app-container/home/actions-section/actions-section.component';
import { ResourcesSectionComponent } from '@popup/pages/app-container/home/resources-section/resources-section.component';
import { SelectAccountSectionComponent } from '@popup/pages/app-container/home/select-account-section/select-account-section.component';
import { TopBarComponent } from '@popup/pages/app-container/home/top-bar/top-bar.component';
import { WalletInfoSectionComponent } from '@popup/pages/app-container/home/wallet-info-section/wallet-info-section.component';
import { RootState } from '@popup/store';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ActiveAccountUtils from 'src/utils/active-account.utils';
import './home.component.css';

const Home = ({
  activeAccount,
  loadActiveAccount,
  accounts,
}: PropsFromRedux) => {
  useEffect(() => {
    if (ActiveAccountUtils.isEmpty(activeAccount) && accounts.length) {
      loadActiveAccount(accounts[0]);
    }
  }, accounts);

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
  return { activeAccount: state.activeAccount, accounts: state.accounts };
};

const connector = connect(mapStateToProps, { loadActiveAccount });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const HomeComponent = connector(Home);
