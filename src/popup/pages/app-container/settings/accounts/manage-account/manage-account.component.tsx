import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { SelectAccountSectionComponent } from '@popup/pages/app-container/home/select-account-section/select-account-section.component';
import { AccountKeysListComponent } from '@popup/pages/app-container/settings/accounts/manage-account/account-keys-list/account-keys-list.component';
import { RootState } from '@popup/store';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import './manage-account.component.scss';

const ManageAccount = ({
  // overrideActiveAccountName,
  setTitleContainerProperties,
}: // accounts,
// loadActiveAccount,
PropsFromRedux) => {
  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_manage_accounts',
      isBackButtonEnabled: true,
    });

    //TODO check if works properly //TODO clean up
    // if (overrideActiveAccountName) {
    //   console.log({ overrideActiveAccountName });
    //   loadActiveAccount(
    //     accounts.find(
    //       (account: LocalAccount) => account.name === overrideActiveAccountName,
    //     )!,
    //   );
    // }
  });

  return (
    <div
      aria-label="settings-manage-account"
      className="settings-manage-account">
      <SelectAccountSectionComponent />
      <AccountKeysListComponent />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    // overrideActiveAccountName: state.navigation.stack[0].params
    //   .overrideActiveAccountName
    //   ? state.navigation.stack[0].params.overrideActiveAccountName
    //   : undefined,
    // accounts: state.accounts,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  // loadActiveAccount,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ManageAccountComponent = connector(ManageAccount);
