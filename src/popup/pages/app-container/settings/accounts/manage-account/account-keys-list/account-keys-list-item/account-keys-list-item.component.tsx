import { removeKey, setAccounts } from '@popup/actions/account.actions';
import { setInfoMessage } from '@popup/actions/message.actions';
import { navigateToWithParams } from '@popup/actions/navigation.actions';
import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { KeyType } from 'src/interfaces/keys.interface';
import { Key } from 'src/interfaces/local-account.interface';
import { Screen } from 'src/reference-data/screen.enum';
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
  activeAccount,
  setInfoMessage,
  navigateToWithParams,
  removeKey,
}: PropsType) => {
  const [isPrivateHidden, setIsPrivateHidden] = useState(true);

  useEffect(() => {
    setIsPrivateHidden(true);
  }, [activeAccount]);

  const copyToClipboard = (key: Key | undefined) => {
    if (key) {
      navigator.clipboard.writeText(key!.toString());
      setInfoMessage('popup_html_copied');
    }
  };

  const handleClickOnRemoveKey = () => {
    removeKey(keyType);
  };

  return (
    <div className="account-keys-list-item">
      <div className="top-panel">
        <div className="key-name">{chrome.i18n.getMessage(keyName)}</div>
        {publicKey && privateKey && (
          <span
            className="material-icons-outlined remove-button"
            onClick={() => handleClickOnRemoveKey()}>
            delete
          </span>
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
                : copyToClipboard(privateKey)
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
        <span
          className="material-icons-outlined add-key-icon"
          onClick={() =>
            navigateToWithParams(Screen.SETTINGS_ADD_KEY, keyType)
          }>
          {Icons.ADD_CIRCLE}
        </span>
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
  navigateToWithParams,
  removeKey,
});
type PropsType = ConnectedProps<typeof connector> & KeyListItemProps;

export const AccountKeysListItemComponent = connector(AccountKeysListItem);
