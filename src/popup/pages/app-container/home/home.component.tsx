import { loadActiveAccount } from '@popup/actions/active-account.actions';
import { setActiveRpc } from '@popup/actions/active-rpc.actions';
import { loadBittrexPrices } from '@popup/actions/bittrex.actions';
import { loadGlobalProperties } from '@popup/actions/global-properties.reducer';
import { ActionsSectionComponent } from '@popup/pages/app-container/home/actions-section/actions-section.component';
import { ResourcesSectionComponent } from '@popup/pages/app-container/home/resources-section/resources-section.component';
import { SelectAccountSectionComponent } from '@popup/pages/app-container/home/select-account-section/select-account-section.component';
import { TopBarComponent } from '@popup/pages/app-container/home/top-bar/top-bar.component';
import { WalletInfoSectionComponent } from '@popup/pages/app-container/home/wallet-info-section/wallet-info-section.component';
import { RootState } from '@popup/store';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ActiveAccountUtils from 'src/utils/active-account.utils';
import RpcUtils from 'src/utils/rpc.utils';
import './home.component.scss';

const Home = ({
  activeAccount,
  loadActiveAccount,
  accounts,
  activeRpc,
  setActiveRpc,
  loadBittrexPrices,
}: PropsFromRedux) => {
  useEffect(() => {
    loadBittrexPrices();
    loadGlobalProperties();
  }, []);

  useEffect(() => {
    if (ActiveAccountUtils.isEmpty(activeAccount) && accounts.length) {
      loadActiveAccount(accounts[0]);
    }
    if (!activeRpc || activeRpc.uri === 'NULL') {
      initActiveRpc();
    }
  }, [accounts, activeRpc]);

  const initActiveRpc = async () => {
    setActiveRpc(await RpcUtils.getCurrentRpc());
  };

  return (
    <div className="home-page">
      {activeRpc && activeRpc.uri !== 'NULL' && (
        <div>
          <TopBarComponent />
          <SelectAccountSectionComponent />
          <ResourcesSectionComponent />
          <WalletInfoSectionComponent />
          <ActionsSectionComponent />
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    accounts: state.accounts,
    activeRpc: state.activeRpc,
  };
};

const connector = connect(mapStateToProps, {
  loadActiveAccount,
  setActiveRpc,
  loadBittrexPrices,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const HomeComponent = connector(Home);
