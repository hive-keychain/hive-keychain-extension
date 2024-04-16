import { setEvmAccounts } from '@popup/evm/actions/accounts.actions';
import { EvmRouterComponent } from '@popup/evm/evm-router.component';
import EvmWalletUtils from '@popup/evm/utils/wallet.utils';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { RootState } from '@popup/multichain/store';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { SplashscreenComponent } from 'src/common-ui/splashscreen/splashscreen.component';

const EvmApp = ({
  navigateTo,
  accounts,
  mk,
  setEvmAccounts,
  isCurrentPageHomePage,
}: PropsFromRedux) => {
  const [displaySplashscreen, setDisplaySplashscreen] = useState(false);
  //TODO： Create appstatus reducer like on hive and use it to determine whether the splashscreen should be displayed
  useEffect(() => {
    if (!accounts.length) {
      navigateTo(Screen.EVM_ADD_WALLET_MAIN);
    } else {
      navigateTo(Screen.EVM_HOME);
    }
  }, [accounts.length]);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setEvmAccounts(await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk));
  };

  return (
    <div className={`App Evm ${isCurrentPageHomePage ? 'homepage' : ''}`}>
      <EvmRouterComponent /> {displaySplashscreen && <SplashscreenComponent />}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    accounts: state.evm.accounts,
    mk: state.mk,
    isCurrentPageHomePage:
      state.navigation.stack[0]?.currentPage === Screen.EVM_HOME,
  };
};

const connector = connect(mapStateToProps, {
  navigateTo,
  setEvmAccounts,
});

type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmAppComponent = connector(EvmApp);
