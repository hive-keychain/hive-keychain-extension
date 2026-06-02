import { ActiveAccount } from '@interfaces/active-account.interface';
import React from 'react';
import { Card } from 'src/common-ui/card/card.component';
import { AccountAuthoritiesListItemComponent } from 'src/popup/hive/pages/app-container/settings/accounts/manage-account-authorities/account-authorities-list/account-authorities-list-item/account-authorities-list-item.component';

interface Props {
  managedAccount: ActiveAccount;
}

const AccountAuthoritiesList = ({ managedAccount }: Props) => {
  const hasAccountAuthorities =
    managedAccount.account.active.account_auths.length > 0 ||
    managedAccount.account.posting.account_auths.length > 0;

  return (
    <div className="account-authorities-list settings-hive-dapps-page">
      <Card className="settings-hive-dapps-card">
        {hasAccountAuthorities ? (
          <div className="authorities-panel settings-hive-dapps-list">
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
          </div>
        ) : (
          <div className="settings-hive-dapps-empty">
            <div className="no-authorities-found">
              {chrome.i18n.getMessage(
                'popup_html_manage_no_accounts_authorities',
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export const AccountAuthoritiesListComponent = AccountAuthoritiesList;
