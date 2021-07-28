import { AccountKeysListItemComponent } from '@popup/pages/app-container/settings/manage-account/account-keys-list/account-keys-list-item/account-keys-list-item.component';
import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { KeyType } from 'src/interfaces/keys.interface';
import './account-keys-list.component.scss';

const AccountKeysList = ({ activeAccount }: PropsType) => {
  return (
    <div className="account-keys-list">
      <AccountKeysListItemComponent
        privateKey={activeAccount.keys.posting}
        publicKey={activeAccount.keys.postingPubkey}
        keyName={'popup_html_posting'}
        keyType={KeyType.POSTING}
      />
      <AccountKeysListItemComponent
        privateKey={activeAccount.keys.active}
        publicKey={activeAccount.keys.activePubkey}
        keyName={'popup_html_active'}
        keyType={KeyType.ACTIVE}
      />
      <AccountKeysListItemComponent
        privateKey={activeAccount.keys.memo}
        publicKey={activeAccount.keys.memoPubkey}
        keyName={'popup_html_memo'}
        keyType={KeyType.MEMO}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { activeAccount: state.activeAccount };
};

const connector = connect(mapStateToProps, {});
type PropsType = ConnectedProps<typeof connector>;

export const AccountKeysListComponent = connector(AccountKeysList);
