import { navigateTo } from '@popup/actions/navigation.actions';
import { AccountKeysListItemComponent } from '@popup/pages/app-container/settings/manage-account/account-keys-list/account-keys-list-item/account-keys-list-item.component';
import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import './account-keys-list.component.css';

const AccountKeysList = ({ navigateTo, activeAccount }: PropsType) => {
  return (
    <div className="account-keys-list">
      {activeAccount.keys.posting && activeAccount.keys.postingPubkey && (
        <AccountKeysListItemComponent
          privateKey={activeAccount.keys.posting}
          publicKey={activeAccount.keys.postingPubkey}
          keyName={'popup_html_posting'}
        />
      )}
      {activeAccount.keys.active && activeAccount.keys.activePubkey && (
        <AccountKeysListItemComponent
          privateKey={activeAccount.keys.active}
          publicKey={activeAccount.keys.activePubkey}
          keyName={'popup_html_active'}
        />
      )}
      {activeAccount.keys.memo && activeAccount.keys.memoPubkey && (
        <AccountKeysListItemComponent
          privateKey={activeAccount.keys.memo}
          publicKey={activeAccount.keys.memoPubkey}
          keyName={'popup_html_memo'}
        />
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { activeAccount: state.activeAccount };
};

const connector = connect(mapStateToProps, { navigateTo });
type PropsType = ConnectedProps<typeof connector>;

export const AccountKeysListComponent = connector(AccountKeysList);
