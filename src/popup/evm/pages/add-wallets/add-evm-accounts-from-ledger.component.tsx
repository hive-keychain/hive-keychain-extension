import { Screen } from '@interfaces/screen.interface';
import { setEvmAccounts } from '@popup/evm/actions/accounts.actions';
import { loadEvmActiveAccount } from '@popup/evm/actions/active-account.actions';
import { EvmActiveAccountUtils } from '@popup/evm/utils/evm-active-account.utils';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/multichain/actions/loading.actions';
import { setSuccessMessage } from '@popup/multichain/actions/message.actions';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import AddEvmAccountsComponent from 'src/ledger/add-evm-accounts/add-evm-accounts.component';

const AddEvmAccountsFromLedger = ({
  chain,
  mk,
  setTitleContainerProperties,
  setEvmAccounts,
  loadEvmActiveAccount,
  navigateTo,
  setSuccessMessage,
  addToLoadingList,
  removeFromLoadingList,
  canGoBack,
}: PropsFromRedux) => {
  const loadingOperation = 'evm_add_accounts_from_ledger';

  useEffect(() => {
    setTitleContainerProperties({
      title: 'evm_add_accounts_from_ledger',
      isBackButtonEnabled: true,
      isCloseButtonDisabled: true,
      onBackAdditional: () => {
        if (!canGoBack) {
          navigateTo(Screen.SETTINGS_ADD_ACCOUNT, true);
        }
      },
    });
    return () => {
      removeFromLoadingList(loadingOperation);
    };
  }, []);

  const refreshAccounts = async () => {
    const accounts = await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk);
    await setEvmAccounts(accounts);

    const activeAccount =
      await EvmActiveAccountUtils.getSavedActiveAccountWallet(chain, accounts);
    if (activeAccount) {
      await loadEvmActiveAccount(chain, activeAccount);
    }
    setSuccessMessage('add_accounts_from_ledger_sucessful');
    navigateTo(Screen.HOME_PAGE, true);
  };

  const closePage = () => {
    navigateTo(Screen.HOME_PAGE, true);
  };

  const handleLoadingChange = (isLoading: boolean) => {
    if (isLoading) {
      addToLoadingList(loadingOperation);
    } else {
      removeFromLoadingList(loadingOperation);
    }
  };

  return (
    <AddEvmAccountsComponent
      chain={chain}
      embedded
      onAccountsAdded={refreshAccounts}
      onClose={closePage}
      onLoadingChange={handleLoadingChange}
    />
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    chain: state.chain as EvmChain,
    mk: state.mk,
    canGoBack: state.navigation.stack.length > 1,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  setEvmAccounts,
  loadEvmActiveAccount,
  navigateTo,
  setSuccessMessage,
  addToLoadingList,
  removeFromLoadingList,
});

type PropsFromRedux = ConnectedProps<typeof connector>;

export const AddEvmAccountsFromLedgerComponent = connector(
  AddEvmAccountsFromLedger,
);
