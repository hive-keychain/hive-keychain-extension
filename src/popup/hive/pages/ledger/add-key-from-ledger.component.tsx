import { KeyType } from '@interfaces/keys.interface';
import { Screen } from '@interfaces/screen.interface';
import { loadActiveAccount } from '@popup/hive/actions/active-account.actions';
import { setAccounts } from '@popup/hive/actions/account.actions';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/multichain/actions/loading.actions';
import { setSuccessMessage } from '@popup/multichain/actions/message.actions';
import { navigateToWithParams } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import AddKeyComponent from 'src/ledger/add-key/add-key.component';
import AccountUtils from '@popup/hive/utils/account.utils';
import { MANAGE_ACCOUNT_SELECTED_NAME_PARAM } from '@popup/hive/pages/app-container/settings/accounts/manage-account/manage-account-selection.utils';

interface AddKeyFromLedgerParams {
  keyType?: KeyType;
  username?: string;
}

const getAddKeyFromLedgerParams = (
  params: AddKeyFromLedgerParams | undefined,
): AddKeyFromLedgerParams => ({
  keyType: params?.keyType,
  username: params?.username,
});

const AddKeyFromLedger = ({
  keyType,
  username,
  mk,
  activeAccountName,
  setTitleContainerProperties,
  setAccounts,
  loadActiveAccount,
  navigateToWithParams,
  setSuccessMessage,
  addToLoadingList,
  removeFromLoadingList,
}: PropsFromRedux) => {
  const loadingOperation = 'add_key_from_ledger';
  const targetUsername = username ?? activeAccountName;

  useEffect(() => {
    setTitleContainerProperties({
      title: 'add_key_from_ledger',
      isBackButtonEnabled: true,
      onBackAdditional: () => {
        navigateToWithParams(
          Screen.SETTINGS_MANAGE_ACCOUNTS,
          {
            username: targetUsername,
            [MANAGE_ACCOUNT_SELECTED_NAME_PARAM]: targetUsername,
          },
          true,
        );
      },
    });
    return () => {
      removeFromLoadingList(loadingOperation);
    };
  }, []);

  const handleKeyAdded = async () => {
    const updatedAccounts = await AccountUtils.getAccountsFromLocalStorage(mk);
    if (!updatedAccounts?.length) {
      return;
    }
    setAccounts(updatedAccounts);

    if (activeAccountName === targetUsername) {
      const updatedActiveAccount = updatedAccounts.find(
        (account) => account.name === activeAccountName,
      );
      if (updatedActiveAccount) {
        await loadActiveAccount(updatedActiveAccount);
      }
    }

    setSuccessMessage('add_key_from_ledger_sucessful');
    navigateToWithParams(
      Screen.SETTINGS_MANAGE_ACCOUNTS,
      {
        username: targetUsername,
        [MANAGE_ACCOUNT_SELECTED_NAME_PARAM]: targetUsername,
      },
      true,
    );
  };

  const handleClose = () => {
    navigateToWithParams(
      Screen.SETTINGS_MANAGE_ACCOUNTS,
      {
        username: targetUsername,
        [MANAGE_ACCOUNT_SELECTED_NAME_PARAM]: targetUsername,
      },
      true,
    );
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
      data-testid={`${Screen.SETTINGS_ADD_KEY_FROM_LEDGER}-page`}>
      <AddKeyComponent
        embedded
        keyType={keyType}
        username={username}
        onKeyAdded={handleKeyAdded}
        onClose={handleClose}
        onLoadingChange={handleLoadingChange}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  const { keyType, username } = getAddKeyFromLedgerParams(
    state.navigation.stack[0].params as AddKeyFromLedgerParams | undefined,
  );

  return {
    keyType,
    username: username ?? state.hive.activeAccount.name,
    mk: state.mk,
    activeAccountName: state.hive.activeAccount.name,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  setAccounts,
  loadActiveAccount,
  navigateToWithParams,
  setSuccessMessage,
  addToLoadingList,
  removeFromLoadingList,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AddKeyFromLedgerComponent = connector(AddKeyFromLedger);
