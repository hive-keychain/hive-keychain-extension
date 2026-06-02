import { RootState } from '@popup/multichain/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Card } from 'src/common-ui/card/card.component';
import { AccountAuthoritiesListItemComponent } from 'src/popup/hive/pages/app-container/settings/accounts/manage-account-authorities/account-authorities-list/account-authorities-list-item/account-authorities-list-item.component';

const AccountAuthoritiesList = ({ activeAccount }: PropsType) => {
  const hasAccountAuthorities =
    activeAccount.account.active.account_auths.length > 0 ||
    activeAccount.account.posting.account_auths.length > 0;

  return (
    <div className="account-authorities-list settings-hive-dapps-page">
      <Card className="settings-hive-dapps-card">
        {hasAccountAuthorities ? (
          <div className="authorities-panel settings-hive-dapps-list">
            <AccountAuthoritiesListItemComponent
              role={'active'}
              authority={activeAccount.account.active}
            />
            <AccountAuthoritiesListItemComponent
              role={'posting'}
              authority={activeAccount.account.posting}
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

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.hive.activeAccount,
  };
};

const connector = connect(mapStateToProps, {});
type PropsType = ConnectedProps<typeof connector>;

export const AccountAuthoritiesListComponent = connector(
  AccountAuthoritiesList,
);
