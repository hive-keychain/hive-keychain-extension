import { RootState } from '@popup/store';
import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Key } from 'src/interfaces/local-account.interface';
import './account-keys-list-item.component.css';

export interface KeyListItemProps {
  privateKey: Key;
  publicKey: Key;
  keyName: string;
}

const AccountKeysListItem = ({ privateKey, publicKey, keyName }: PropsType) => {
  const [isPrivateHidden, setIsPrivateHidden] = useState(true);

  const copyToClipboard = (key: Key) => {
    document.execCommand('copy');
  };

  return (
    <div className="account-keys-list-item">
      <div className="top-panel">
        <div className="key-name">{chrome.i18n.getMessage(keyName)}</div>
        <div className="remove-button">
          {chrome.i18n.getMessage('popup_html_remove')}
        </div>
      </div>
      <div
        className="private-key key-field"
        onClick={() =>
          isPrivateHidden
            ? setIsPrivateHidden(false)
            : copyToClipboard(publicKey)
        }>
        {isPrivateHidden
          ? chrome.i18n.getMessage('popup_accounts_reveal_private')
          : privateKey}
      </div>
      <div className="public-key" onClick={() => copyToClipboard(publicKey)}>
        {publicKey}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsType = ConnectedProps<typeof connector> & KeyListItemProps;

export const AccountKeysListItemComponent = connector(AccountKeysListItem);
