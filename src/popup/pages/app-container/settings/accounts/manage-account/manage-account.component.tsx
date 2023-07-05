import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { SelectAccountSectionComponent } from '@popup/pages/app-container/home/select-account-section/select-account-section.component';
import { AccountKeysListComponent } from '@popup/pages/app-container/settings/accounts/manage-account/account-keys-list/account-keys-list.component';
import { WrongKeysOnUser } from '@popup/pages/app-container/wrong-key-popup/wrong-key-popup.component';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { KeysUtils } from 'src/utils/keys.utils';
import './manage-account.component.scss';

const ManageAccount = ({
  setTitleContainerProperties,
  activeAccount,
  localAccounts,
}: PropsFromRedux) => {
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
    if (activeAccount) {
      const selectedLocalAccount = localAccounts.find(
        (localAccount) => localAccount.name === activeAccount.name!,
      );
      let tempFoundWrongKeys: WrongKeysOnUser;
      tempFoundWrongKeys = { [activeAccount.name!]: [] };
      for (const [key, value] of Object.entries(selectedLocalAccount!.keys)) {
        tempFoundWrongKeys = KeysUtils.checkWrongKeyOnAccount(
          key,
          value,
          activeAccount.name!,
          activeAccount.account,
          tempFoundWrongKeys,
        );
      }
      if (tempFoundWrongKeys[activeAccount.name!].length > 0) {
        setWrongKeysFound(tempFoundWrongKeys);
      } else {
        setWrongKeysFound(undefined);
      }
    }
  }, [activeAccount]);

  return (
    <div
      aria-label="settings-manage-account"
      className="settings-manage-account">
      <SelectAccountSectionComponent />
      <AccountKeysListComponent wrongKeysFound={wrongKeysFound} />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    localAccounts: state.accounts,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ManageAccountComponent = connector(ManageAccount);
