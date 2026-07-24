import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/multichain/actions/message.actions';
import {
  goBack,
  navigateToWithParams,
} from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { KeyType } from 'src/interfaces/keys.interface';
import { addKey } from 'src/popup/hive/actions/account.actions';
// import { LedgerUtils } from 'src/utils/ledger.utils';
import type { AuthorityType, ExtendedAccount } from '@hiveio/dhive';
import { Screen } from '@interfaces/screen.interface';
import { refreshActiveAccount } from '@popup/hive/actions/active-account.actions';
import AccountUtils from '@popup/hive/utils/account.utils';
import { LedgerRouteUtils } from '@popup/multichain/utils/ledger-route.utils';
import { ArrayUtils } from 'src/utils/array.utils';

import { HtmlUtils } from 'src/utils/html.utils';
import { I18nUtils } from 'src/utils/i18n.utils';
interface AddKeyNavParams {
  keyType: KeyType;
  username?: string;
}

const parseAddKeyNavParams = (
  params: KeyType | AddKeyNavParams | undefined,
): AddKeyNavParams => {
  if (params === undefined) {
    return { keyType: KeyType.ACTIVE };
  }
  if (typeof params === 'string') {
    return { keyType: params as KeyType };
  }
  return params;
};

export const AddKey = ({
  keyType,
  activeAccountName,
  activeAccount,
  localAccounts,
  mk,
  addKey,
  setTitleContainerProperties,
  setErrorMessage,
  refreshActiveAccount,
  setSuccessMessage,
  goBack,
  navigateToWithParams,
  isLedgerSupported,
}: PropsType) => {
  const [privateKey, setPrivateKey] = useState('');
  const [availableAuths, setAvailableAuths] = useState<any[]>([]);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_add_key',
      isBackButtonEnabled: true,
    });
    loadAuthorizedAccounts();
  }, []);

  const importKey = async () => {
    if (privateKey.trim().length === 0) {
      setErrorMessage('popup_accounts_fill');
      return;
    }
    await addKey(
      privateKey.trim(),
      keyType,
      setErrorMessage,
      activeAccountName,
    );
    goBack();
  };

  const navigateToUseLedger = async () => {
    if (!activeAccountName) {
      return;
    }
    if (
      await LedgerRouteUtils.openInSidePanelFromToolbarPopup(
        LedgerRouteUtils.buildAddKeyHash(keyType, activeAccountName),
      )
    ) {
      return;
    }
    navigateToWithParams(Screen.SETTINGS_ADD_KEY_FROM_LEDGER, {
      keyType,
      username: activeAccountName,
    });
  };

  /** Memo uses `memo_key` (public key string), not an Authority — only owner/active/posting have account_auths. */
  const getAuthorityForKeyType = (
    account: ExtendedAccount,
    kt: KeyType,
  ): AuthorityType | undefined => {
    switch (kt) {
      case KeyType.OWNER:
        return account.owner;
      case KeyType.ACTIVE:
        return account.active;
      case KeyType.POSTING:
        return account.posting;
      case KeyType.MEMO:
      default:
        return undefined;
    }
  };

  const loadAuthorizedAccounts = async () => {
    const extendedAccount = await AccountUtils.getExtendedAccount(
      activeAccountName!,
    );
    const authority = getAuthorityForKeyType(extendedAccount, keyType);
    const auths: string[] =
      authority?.account_auths?.map((auth) => auth[0]) ?? [];

    setAvailableAuths(
      ArrayUtils.findCommons(
        auths,
        localAccounts.map((la) => la.name),
      ),
    );
  };

  const addAuth = async (username: string) => {
    const extendedAccount = await AccountUtils.getExtendedAccount(
      activeAccountName!,
    );
    const targetLocalAccount = localAccounts.find(
      (localAccount) => localAccount.name === activeAccountName,
    );
    const targetActiveAccount = {
      ...activeAccount,
      name: activeAccountName,
      account: extendedAccount,
      keys: targetLocalAccount?.keys ?? activeAccount.keys,
    };
    await AccountUtils.addAuthorizedKey(
      targetActiveAccount,
      username,
      localAccounts,
      mk,
      keyType,
    );
    refreshActiveAccount();
    setSuccessMessage('html_popup_successfully_add_key');
    goBack();
  };

  return (
    <div
      className="add-key-page"
      data-testid={`${Screen.SETTINGS_ADD_KEY}-page`}>
      <div
        data-testid="add-key-page-paragraph-introduction"
        className="caption"
        dangerouslySetInnerHTML={{
          __html: HtmlUtils.getSafeI18nHtml('popup_html_add_key_text', [
            keyType.substring(0, 1) + keyType.substring(1).toLowerCase(),
          ]),
        }}></div>

      <InputComponent
        dataTestId="input-private-key"
        type={InputType.PASSWORD}
        placeholder="popup_html_private_key"
        value={privateKey}
        onChange={setPrivateKey}
        onEnterPress={importKey}
      />

      {availableAuths.length > 0 && (
        <div className="available-auths">
          <div className="caption">
            {I18nUtils.getMessage('html_add_available_authorities_caption')}
          </div>
          <div className="auths">
            {availableAuths.map((auth, index) => (
              <div className="auth" key={`account-auth-item-${auth}-${index}`}>
                <button
                  type="button"
                  className="item-account"
                  onClick={() => addAuth(auth)}>
                  <img
                    className="account-img"
                    src={`https://images.hive.blog/u/${auth}/avatar`}
                    alt=""
                    onError={(e: any) => {
                      e.target.onError = null;
                      e.target.src = '/assets/images/menu/accounts.svg';
                    }}
                  />
                  <div className="account-name">{auth}</div>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {keyType === KeyType.ACTIVE && isLedgerSupported && (
        <button
          type="button"
          className="add-using-ledger"
          onClick={navigateToUseLedger}>
          {I18nUtils.getMessage('popup_html_add_using_ledger')}
        </button>
      )}

      <div className="fill-space"></div>

      <ButtonComponent
        dataTestId="import-keys-button"
        label="popup_html_import_key"
        onClick={importKey}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  const { keyType, username } = parseAddKeyNavParams(
    state.navigation.stack[0].params as KeyType | AddKeyNavParams,
  );
  return {
    keyType,
    activeAccountName: username ?? state.hive.activeAccount.name,
    isLedgerSupported: state.hive.appStatus.isLedgerSupported,
    activeAccount: state.hive.activeAccount,
    localAccounts: state.hive.accounts,
    mk: state.mk,
  };
};

const connector = connect(mapStateToProps, {
  goBack,
  addKey,
  setTitleContainerProperties,
  setErrorMessage,
  setSuccessMessage,
  refreshActiveAccount,
  navigateToWithParams,
});
type PropsType = ConnectedProps<typeof connector>;

export const AddKeyComponent = connector(AddKey);
