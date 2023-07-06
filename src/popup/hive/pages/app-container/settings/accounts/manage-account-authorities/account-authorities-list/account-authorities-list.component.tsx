import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { AccountAuthoritiesListItemComponent } from 'src/popup/hive/pages/app-container/settings/accounts/manage-account-authorities/account-authorities-list/account-authorities-list-item/account-authorities-list-item.component';
import { RootState } from 'src/popup/hive/store';
import './account-authorities-list.component.scss';

const AccountAuthoritiesList = ({ activeAccount }: PropsType) => {
  return (
    <div className="account-authorities-list">
      <div className="authorities-panel">
        <AccountAuthoritiesListItemComponent
          role={'active'}
          authority={activeAccount.account.active}
        />
        <AccountAuthoritiesListItemComponent
          role={'posting'}
          authority={activeAccount.account.posting}
        />
        {activeAccount.account.active.account_auths.length === 0 &&
          activeAccount.account.posting.account_auths.length === 0 && (
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

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
  };
};

const connector = connect(mapStateToProps, {});
type PropsType = ConnectedProps<typeof connector>;

export const AccountAuthoritiesListComponent = connector(
  AccountAuthoritiesList,
);
