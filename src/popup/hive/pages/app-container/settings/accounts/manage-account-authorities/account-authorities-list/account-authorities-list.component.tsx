import { ActiveAccount } from '@interfaces/active-account.interface';
import React from 'react';
import { AccountAuthoritiesListItemComponent } from 'src/popup/hive/pages/app-container/settings/accounts/manage-account-authorities/account-authorities-list/account-authorities-list-item/account-authorities-list-item.component';

interface Props {
  managedAccount: ActiveAccount;
}

const AccountAuthoritiesList = ({ managedAccount }: Props) => {
  return (
    <div className="account-authorities-list">
      <div className="authorities-panel">
        <AccountAuthoritiesListItemComponent
          role={'active'}
          authority={managedAccount.account.active}
          managedAccount={managedAccount}
        />
        <AccountAuthoritiesListItemComponent
          role={'posting'}
          authority={managedAccount.account.posting}
          managedAccount={managedAccount}
        />
        {managedAccount.account.active.account_auths.length === 0 &&
          managedAccount.account.posting.account_auths.length === 0 && (
            <div className="no-authorities-found">
              {chrome.i18n.getMessage(
                'popup_html_manage_no_accounts_authorities',
              )}
            </div>
          )}
      </div>
    </div>
  );
};

export const AccountAuthoritiesListComponent = AccountAuthoritiesList;
