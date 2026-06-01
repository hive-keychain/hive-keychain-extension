import { Screen } from '@interfaces/screen.interface';
import { SelectAccountSectionComponent } from '@popup/hive/pages/app-container/select-account-section/select-account-section.component';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { AccountKeysListComponent } from 'src/popup/hive/pages/app-container/settings/accounts/manage-account/account-keys-list/account-keys-list.component';
import { WrongKeysOnUser } from 'src/popup/hive/pages/app-container/wrong-key-popup/wrong-key-popup.component';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import { KeysUtils } from 'src/popup/hive/utils/keys.utils';
import { getManageAccountDefaultSelection } from 'src/popup/hive/pages/app-container/settings/accounts/manage-account/manage-account-selection.utils';

const ManageAccount = ({
  setTitleContainerProperties,
  activeAccount,
  localAccounts,
  manageAccountNavigationParams,
  manageAccountRestoreParams,
}: PropsFromRedux) => {
  const [selectedAccountName, setSelectedAccountName] = useState(() =>
    getManageAccountDefaultSelection(
      activeAccount.name,
      localAccounts,
      manageAccountNavigationParams,
      manageAccountRestoreParams,
    ),
  );
  const [wrongKeysFound, setWrongKeysFound] = useState<
    WrongKeysOnUser | undefined
  >();

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_manage_accounts',
      isBackButtonEnabled: true,
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    const checkWrongKeysForSelectedAccount = async () => {
      if (!selectedAccountName) {
        setWrongKeysFound(undefined);
        return;
      }

      const selectedLocalAccount = localAccounts.find(
        (localAccount) => localAccount.name === selectedAccountName,
      );
      if (!selectedLocalAccount) {
        setWrongKeysFound(undefined);
        return;
      }

      const extendedAccount =
        await AccountUtils.getExtendedAccount(selectedAccountName);
      if (cancelled) {
        return;
      }

      let tempFoundWrongKeys: WrongKeysOnUser = { [selectedAccountName]: [] };
      for (const [key, value] of Object.entries(selectedLocalAccount.keys)) {
        tempFoundWrongKeys = KeysUtils.checkWrongKeyOnAccount(
          key,
          value,
          selectedAccountName,
          extendedAccount,
          tempFoundWrongKeys,
        );
      }
      if (tempFoundWrongKeys[selectedAccountName].length > 0) {
        setWrongKeysFound(tempFoundWrongKeys);
      } else {
        setWrongKeysFound(undefined);
      }
    };

    void checkWrongKeysForSelectedAccount();

    return () => {
      cancelled = true;
    };
  }, [selectedAccountName, localAccounts]);

  return (
    <div
      data-testid={`${Screen.SETTINGS_MANAGE_ACCOUNTS}-page`}
      className="settings-manage-account">
      <SelectAccountSectionComponent
        background="white"
        fullSize
        hideManageAccountsOption
        selectedAccountName={selectedAccountName}
        onAccountSelected={setSelectedAccountName}
      />
      <AccountKeysListComponent
        selectedAccountName={selectedAccountName}
        onAccountSelected={setSelectedAccountName}
        wrongKeysFound={wrongKeysFound}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.hive.activeAccount,
    localAccounts: state.hive.accounts,
    manageAccountNavigationParams: state.navigation.stack[0]?.params,
    manageAccountRestoreParams: state.navigation.stack[0]?.previousParams,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ManageAccountComponent = connector(ManageAccount);
