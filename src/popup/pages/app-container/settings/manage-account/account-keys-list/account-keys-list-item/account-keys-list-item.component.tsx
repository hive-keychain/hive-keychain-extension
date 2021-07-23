import { setInfoMessage } from '@popup/actions/message.actions';
import { RootState } from '@popup/store';
import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Key } from 'src/interfaces/local-account.interface';
import './account-keys-list-item.component.scss';

export interface KeyListItemProps {
  privateKey: Key;
  publicKey: Key;
  keyName: string;
}

const AccountKeysListItem = ({
  privateKey,
  publicKey,
  keyName,
  setInfoMessage,
}: PropsType) => {
  const [isPrivateHidden, setIsPrivateHidden] = useState(true);

  const copyToClipboard = (key: Key) => {
    navigator.clipboard.writeText(key!.toString());
    setInfoMessage('popup_html_copied');
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
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, { setInfoMessage });
type PropsType = ConnectedProps<typeof connector> & KeyListItemProps;

export const AccountKeysListItemComponent = connector(AccountKeysListItem);
