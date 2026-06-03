import { Screen } from '@interfaces/screen.interface';
import { loadActiveAccount } from '@popup/hive/actions/active-account.actions';
import { setAccounts } from '@popup/hive/actions/account.actions';
import AccountUtils from '@popup/hive/utils/account.utils';
import { setActiveAccountType } from '@popup/multichain/actions/active-account-type.actions';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/multichain/actions/loading.actions';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { setSuccessMessage } from '@popup/multichain/actions/message.actions';
import { ChainType } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import React, { useEffect } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import AddAccountsComponent from 'src/ledger/add-accounts/add-accounts.component';

const AddAccountsFromLedger = ({
  mk,
  setTitleContainerProperties,
  setAccounts,
  setActiveAccountType,
  loadActiveAccount,
  navigateTo,
  setSuccessMessage,
  addToLoadingList,
  removeFromLoadingList,
  canGoBack,
}: PropsFromRedux) => {
  const loadingOperation = 'add_accounts_from_ledger';

  useEffect(() => {
    setTitleContainerProperties({
      title: 'add_accounts_from_ledger',
      isBackButtonEnabled: true,
      onBackAdditional: () => {
        if (!canGoBack) {
          navigateTo(Screen.ACCOUNT_PAGE_INIT_ACCOUNT, true);
        }
      },
    });
    return () => {
      removeFromLoadingList(loadingOperation);
    };
  }, []);

  const refreshAccounts = async () => {
    const accounts = await AccountUtils.getAccountsFromLocalStorage(mk);
    if (!accounts?.length) {
      return;
    }

    setAccounts(accounts);
    setActiveAccountType(ChainType.HIVE);
    await loadActiveAccount(accounts[0]);
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
    <div
      className="ledger-page"
      data-testid={`${Screen.ACCOUNT_PAGE_ADD_ACCOUNTS_FROM_LEDGER}-page`}>
      <AddAccountsComponent
        embedded
        onAccountsAdded={refreshAccounts}
        onClose={closePage}
        onLoadingChange={handleLoadingChange}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  mk: state.mk,
  canGoBack: state.navigation.stack.length > 1,
});

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  setAccounts,
  setActiveAccountType,
  loadActiveAccount,
  navigateTo,
  setSuccessMessage,
  addToLoadingList,
  removeFromLoadingList,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AddAccountsFromLedgerComponent = connector(AddAccountsFromLedger);
