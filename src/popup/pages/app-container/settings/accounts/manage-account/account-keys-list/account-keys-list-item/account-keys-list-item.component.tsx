import { removeKey, setAccounts } from '@popup/actions/account.actions';
import { loadActiveAccount } from '@popup/actions/active-account.actions';
import { setInfoMessage } from '@popup/actions/message.actions';
import {
  goBack,
  navigateToWithParams,
} from '@popup/actions/navigation.actions';
import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import { KeyType } from 'src/interfaces/keys.interface';
import { Key, LocalAccount } from 'src/interfaces/local-account.interface';
import { Screen } from 'src/reference-data/screen.enum';
import { KeysUtils } from 'src/utils/keys.utils';
import './account-keys-list-item.component.scss';

export interface KeyListItemProps {
  privateKey?: Key;
  publicKey?: Key;
  keyName: string;
  keyType: KeyType;
  canDelete: boolean;
}

const AccountKeysListItem = ({
  privateKey,
  publicKey,
  keyName,
  keyType,
  activeAccount,
  accounts,
  canDelete,
  setInfoMessage,
  navigateToWithParams,
  removeKey,
  goBack,
  loadActiveAccount,
}: PropsType) => {
  const [isPrivateHidden, setIsPrivateHidden] = useState(true);
  const [isAuthorizedAccount, setIsAuthorizedAccount] = useState(false);

  useEffect(() => {
    setIsPrivateHidden(true);
  }, [activeAccount]);

  useEffect(() => {
    if (publicKey) {
      setIsAuthorizedAccount(KeysUtils.isAuthorizedAccount(publicKey));
    }
  }, [publicKey]);

  const copyToClipboard = (key: Key | undefined) => {
    if (key) {
      navigator.clipboard.writeText(key!.toString());
      setInfoMessage('popup_html_copied');
    }
  };

  const handleClickOnRemoveKey = () => {
    const keyTypeLabel = chrome.i18n.getMessage(keyType.toLowerCase());

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage('html_popup_delete_key_confirm', [
        keyTypeLabel,
        activeAccount.name!,
      ]),
      title: 'html_popup_delete_key',
      afterConfirmAction: async () => {
        removeKey(keyType);
        goBack();
      },
    });
  };

  const goToAccount = (publicKey: Key) => {
    const nextAccount = accounts.find(
      (localAccount: LocalAccount) =>
        localAccount.name === publicKey!.toString().split('@')[1],
    );
    if (nextAccount) {
      loadActiveAccount(nextAccount);
    }
  };

  return (
    <div className="account-keys-list-item">
      <div className="top-panel">
        <div className="key-name">{chrome.i18n.getMessage(keyName)}</div>
        {publicKey && privateKey && canDelete && (
          <Icon
            ariaLabel={`icon-remove-key-${chrome.i18n.getMessage(keyName)}`}
            onClick={() => handleClickOnRemoveKey()}
            name={Icons.DELETE}
            type={IconType.OUTLINED}
            additionalClassName="remove-button"></Icon>
        )}
      </div>

      {!privateKey && !publicKey && (
        <Icon
          onClick={() => navigateToWithParams(Screen.SETTINGS_ADD_KEY, keyType)}
          name={Icons.ADD_CIRCLE}
          type={IconType.OUTLINED}
          additionalClassName="add-key-icon"></Icon>
      )}

      {(publicKey || privateKey) && (
        <div className="keys-panel">
          {!isAuthorizedAccount && (
            <>
              <div
                aria-label={`clickeable-account-key-${chrome.i18n.getMessage(
                  keyName,
                )}`}
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
            </>
          )}
          {isAuthorizedAccount && publicKey && (
            <div
              className="using-authorized-account"
              onClick={() => goToAccount(publicKey)}>
              {chrome.i18n.getMessage('html_popup_using_authorized_account', [
                publicKey,
              ])}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    accounts: state.accounts as LocalAccount[],
    activeAccount: state.activeAccount,
  };
};

const connector = connect(mapStateToProps, {
  setInfoMessage,
  setAccounts,
  navigateToWithParams,
  removeKey,
  goBack,
  loadActiveAccount,
});
type PropsType = ConnectedProps<typeof connector> & KeyListItemProps;

export const AccountKeysListItemComponent = connector(AccountKeysListItem);
