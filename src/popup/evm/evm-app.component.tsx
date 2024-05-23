import { Screen } from '@interfaces/screen.interface';
import { setEvmAccounts } from '@popup/evm/actions/accounts.actions';
import { fetchPrices } from '@popup/evm/actions/price.actions';
import { EvmRouterComponent } from '@popup/evm/evm-router.component';
import EvmWalletUtils from '@popup/evm/utils/wallet.utils';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { SplashscreenComponent } from 'src/common-ui/splashscreen/splashscreen.component';
import Config from 'src/config';

const EvmApp = ({
  accounts,
  mk,
  isCurrentPageHomePage,
  appStatus,
  chain,
  navigateTo,
  setEvmAccounts,
  fetchPrices,
}: PropsFromRedux) => {
  const [displaySplashscreen, setDisplaySplashscreen] = useState(true);
  useEffect(() => {
    if (!accounts.length) {
      navigateTo(Screen.EVM_ADD_WALLET_MAIN);
    } else {
      navigateTo(Screen.EVM_HOME);
    }
  }, [accounts.length]);

  useEffect(() => {
    setDisplaySplashscreen(true);
    init();
    fetchPrices();
  }, [chain]);

  useEffect(() => {
    if (displaySplashscreen) {
      if (appStatus.priceLoaded) {
        setTimeout(() => {
          setDisplaySplashscreen(false);
        }, Config.loader.minDuration);
      }
    }
  }, [appStatus, displaySplashscreen]);

  const init = async () => {
    setEvmAccounts(await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk));
  };

  return (
    <div className={`App evm ${isCurrentPageHomePage ? 'homepage' : ''}`}>
      <EvmRouterComponent />
      {displaySplashscreen && <SplashscreenComponent />}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    accounts: state.evm.accounts,
    mk: state.mk,
    isCurrentPageHomePage:
      state.navigation.stack[0]?.currentPage === Screen.EVM_HOME,
    appStatus: state.evm.appStatus,
    chain: state.chain,
  };
};

const connector = connect(mapStateToProps, {
  navigateTo,
  setEvmAccounts,
  fetchPrices,
});

type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmAppComponent = connector(EvmApp);
