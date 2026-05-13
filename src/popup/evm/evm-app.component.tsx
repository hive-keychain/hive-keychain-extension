import { Screen } from '@interfaces/screen.interface';
import { setEvmAccounts } from '@popup/evm/actions/accounts.actions';
import { loadEvmActiveAccount } from '@popup/evm/actions/active-account.actions';
import { EvmRouterComponent } from '@popup/evm/evm-router.component';
import { EvmActiveAccountUtils } from '@popup/evm/utils/evm-active-account.utils';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import {
  navigateTo,
  navigateToWithParams,
} from '@popup/multichain/actions/navigation.actions';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { LoadingState } from '@popup/multichain/reducers/loading.reducer';
import { RootState } from '@popup/multichain/store';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import React, { useEffect, useRef, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import { SplashscreenComponent } from 'src/common-ui/splashscreen/splashscreen.component';
import Config from 'src/config';
import Logger from 'src/utils/logger.utils';

const EvmApp = ({
  accounts,
  activeAccount,
  mk,
  isCurrentPageHomePage,
  appStatus,
  chain,
  loadingState,
  loading,
  navigateTo,
  navigateToWithParams,
  setEvmAccounts,
  loadEvmActiveAccount,
}: PropsFromRedux) => {
  const [displaySplashscreen, setDisplaySplashscreen] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);
  const transactionResolutionRefreshInFlight = useRef(false);
  const transactionResolutionRefreshQueued = useRef(false);

  useEffect(() => {
    if (!isAppReady) {
      return;
    }

    if (!accounts.length) {
      navigateToWithParams(Screen.EVM_ADD_WALLET_MAIN, { resetOnBack: true });
    } else {
      navigateTo(Screen.HOME_PAGE, true);
    }
  }, [accounts.length, isAppReady]);

  useEffect(() => {
    setDisplaySplashscreen(true);
    setIsAppReady(false);
    init();
  }, [chain]);

  useEffect(() => {
    const onResolvedEvmTransaction = (message: any) => {
      if (message.command !== BackgroundCommand.EVM_TRANSACTION_RESOLVED) {
        return;
      }

      const resolvedChainId = Number(message.value?.chainId);
      const currentChainId = Number(chain.chainId);
      const resolvedWallet = message.value?.from?.toLowerCase();
      const currentWallet = activeAccount.wallet?.address?.toLowerCase();

      if (
        resolvedChainId !== currentChainId ||
        !resolvedWallet ||
        resolvedWallet !== currentWallet
      ) {
        return;
      }

      void refreshActiveAccountAfterResolvedTransaction();
    };

    const refreshActiveAccountAfterResolvedTransaction = async () => {
      if (transactionResolutionRefreshInFlight.current) {
        transactionResolutionRefreshQueued.current = true;
        return;
      }

      transactionResolutionRefreshInFlight.current = true;
      try {
        do {
          transactionResolutionRefreshQueued.current = false;
          await loadEvmActiveAccount(chain, activeAccount.wallet);
        } while (transactionResolutionRefreshQueued.current);
      } finally {
        transactionResolutionRefreshInFlight.current = false;
      }
    };

    chrome.runtime.onMessage.addListener(onResolvedEvmTransaction);

    return () => {
      chrome.runtime.onMessage.removeListener(onResolvedEvmTransaction);
    };
  }, [activeAccount.wallet, chain, loadEvmActiveAccount]);

  useEffect(() => {
    if (!displaySplashscreen || !isAppReady) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDisplaySplashscreen(false);
    }, Config.loader.minDuration);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [appStatus, displaySplashscreen, isAppReady]);

  const init = async () => {
    try {
      const localAccounts =
        await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk);
      setEvmAccounts(localAccounts);

      const wallet = await EvmActiveAccountUtils.getSavedActiveAccountWallet(
        chain,
        localAccounts,
      );
      loadEvmActiveAccount(chain, wallet);
    } catch (err) {
      Logger.log(err);
    } finally {
      setIsAppReady(true);
    }
  };

  if (!isAppReady || displaySplashscreen) {
    return (
      <div className={`App evm ${isCurrentPageHomePage ? 'homepage' : ''}`}>
        <SplashscreenComponent />
      </div>
    );
  }

  return (
    <div className={`App evm ${isCurrentPageHomePage ? 'homepage' : ''}`}>
      {<EvmRouterComponent />}
      {loading && (
        <LoadingComponent
          operations={loadingState.loadingOperations}
          caption={loadingState.caption}
          loadingPercentage={loadingState.loadingPercentage}
        />
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    accounts: state.evm.accounts,
    activeAccount: state.evm.activeAccount,
    mk: state.mk,
    isCurrentPageHomePage:
      state.navigation.stack[0]?.currentPage === Screen.HOME_PAGE,
    appStatus: state.evm.appStatus,
    chain: state.chain as EvmChain,
    loadingState: state.loading as LoadingState,
    loading: state.loading.loadingOperations.length > 0,
  };
};

const connector = connect(mapStateToProps, {
  navigateTo,
  navigateToWithParams,
  setEvmAccounts,
  loadEvmActiveAccount,
});

type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmAppComponent = connector(EvmApp);
