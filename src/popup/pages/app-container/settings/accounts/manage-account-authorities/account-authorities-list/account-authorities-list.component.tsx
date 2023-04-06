import { setAccounts } from '@popup/actions/account.actions';
import { loadActiveAccount } from '@popup/actions/active-account.actions';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/actions/loading.actions';
import { navigateToWithParams } from '@popup/actions/navigation.actions';
import { AccountAuthoritiesListItemComponent } from '@popup/pages/app-container/settings/accounts/manage-account-authorities/account-authorities-list/account-authorities-list-item/account-authorities-list-item.component';
import { RootState } from '@popup/store';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import './account-authorities-list.component.scss';

// TODO remove unused properties

const AccountAuthoritiesList = ({
  activeAccount,
  accounts,
  setAccounts,
  loadActiveAccount,
  navigateToWithParams,
  addToLoadingList,
  removeFromLoadingList,
}: PropsType) => {
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
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    accounts: state.accounts as LocalAccount[],
  };
};

const connector = connect(mapStateToProps, {
  setAccounts,
  loadActiveAccount,
  navigateToWithParams,
  addToLoadingList,
  removeFromLoadingList,
});
type PropsType = ConnectedProps<typeof connector>;

export const AccountAuthoritiesListComponent = connector(
  AccountAuthoritiesList,
);
