import { AccountAuthoritiesListItemComponent } from '@popup/pages/app-container/settings/accounts/manage-account-authorities/account-authorities-list/account-authorities-list-item/account-authorities-list-item.component';
import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
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
