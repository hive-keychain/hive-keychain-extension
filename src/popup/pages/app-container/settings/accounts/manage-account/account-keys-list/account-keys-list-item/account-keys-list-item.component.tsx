import { setAccounts } from '@popup/actions/account.actions';
import { refreshActiveAccount } from '@popup/actions/active-account.actions';
import { setInfoMessage } from '@popup/actions/message.actions';
import { RootState } from '@popup/store';
import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { KeyType } from 'src/interfaces/keys.interface';
import { Key } from 'src/interfaces/local-account.interface';
import AccountUtils from 'src/utils/account.utils';
import './account-keys-list-item.component.scss';

export interface KeyListItemProps {
  privateKey?: Key;
  publicKey?: Key;
  keyName: string;
  keyType: KeyType;
}

const AccountKeysListItem = ({
  privateKey,
  publicKey,
  keyName,
  keyType,
  setInfoMessage,
  setAccounts,
  refreshActiveAccount,
  activeAccount,
  accounts,
}: PropsType) => {
  const [isPrivateHidden, setIsPrivateHidden] = useState(true);

  const copyToClipboard = (key: Key | undefined) => {
    if (key) {
      navigator.clipboard.writeText(key!.toString());
      setInfoMessage('popup_html_copied');
    }
  };

  const removeKey = () => {
    setAccounts(AccountUtils.deleteKey(keyType, accounts, activeAccount));
    refreshActiveAccount();
  };

  return (
    <div className="account-keys-list-item">
      <div className="top-panel">
        <div className="key-name">{chrome.i18n.getMessage(keyName)}</div>
        {publicKey && privateKey && (
          <div className="remove-button" onClick={() => removeKey()}>
            {chrome.i18n.getMessage('popup_html_remove')}
          </div>
        )}
      </div>
      {publicKey && privateKey ? (
        <div className="keys-panel">
          <div
            className={`private-key key-field ${
              isPrivateHidden ? 'hidden' : 'show'
            }`}
            onClick={() =>
              isPrivateHidden
                ? setIsPrivateHidden(false)
                : copyToClipboard(publicKey)
            }>
            {isPrivateHidden
              ? chrome.i18n.getMessage('popup_accounts_reveal_private')
              : privateKey}
          </div>
          <div
            className="public-key key-field"
            onClick={() => copyToClipboard(publicKey)}>
            {publicKey}
          </div>
        </div>
      ) : (
        <div className="add-key-icon">
          <img src="/assets/images/plus_key.png" />
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { accounts: state.accounts, activeAccount: state.activeAccount };
};

const connector = connect(mapStateToProps, {
  setInfoMessage,
  setAccounts,
  refreshActiveAccount,
});
type PropsType = ConnectedProps<typeof connector> & KeyListItemProps;

export const AccountKeysListItemComponent = connector(AccountKeysListItem);
