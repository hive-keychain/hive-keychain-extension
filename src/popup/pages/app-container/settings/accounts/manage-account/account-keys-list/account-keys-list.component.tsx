import { setAccounts } from '@popup/actions/account.actions';
import { loadActiveAccount } from '@popup/actions/active-account.actions';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/actions/loading.actions';
import {
  navigateTo,
  navigateToWithParams,
} from '@popup/actions/navigation.actions';
import { AccountKeysListItemComponent } from '@popup/pages/app-container/settings/accounts/manage-account/account-keys-list/account-keys-list-item/account-keys-list-item.component';
import { WrongKeysOnUser } from '@popup/pages/app-container/wrong-key-popup/wrong-key-popup.component';
import { RootState } from '@popup/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { Screen } from '@reference-data/screen.enum';
import { KeychainKeyTypesLC } from 'hive-keychain-commons';
import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { KeyType } from 'src/interfaces/keys.interface';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import AccountUtils from 'src/utils/account.utils';
import { KeysUtils } from 'src/utils/keys.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import './account-keys-list.component.scss';

interface AccountKeysListProps {
  wrongKeysFound?: WrongKeysOnUser;
}

const AccountKeysList = ({
  wrongKeysFound,
  activeAccount,
  accounts,
  setAccounts,
  loadActiveAccount,
  navigateToWithParams,
  navigateTo,
  addToLoadingList,
  removeFromLoadingList,
}: PropsType & AccountKeysListProps) => {
  const [qrCodeDisplayed, setQRCodeDisplayed] = useState(false);
  const [account, setAccount] = useState<LocalAccount>();
  const [canDeleteKey, setCanDeleteKey] = useState(true);

  const qrCodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQRCodeDisplayed(false);
    const acc = accounts.find(
      (account: LocalAccount) => account.name === activeAccount.name,
    );
    setAccount(acc!);
    setCanDeleteKey(KeysUtils.keysCount(activeAccount.keys) > 2);
  }, [activeAccount]);

  const isWrongKey = (keyType: KeychainKeyTypesLC) => {
    return (
      wrongKeysFound &&
      wrongKeysFound[activeAccount.name!] &&
      !!wrongKeysFound[activeAccount.name!].find(
        (keyFound) => keyFound === keyType,
      )
    );
  };

  const deleteAccount = () => {
    let warningMessage, warningParams;
    const hasAuthorizedAccountLinkedToActiveAccount = accounts.some((account) =>
      [
        account.keys.activePubkey,
        account.keys.memoPubkey,
        account.keys.postingPubkey,
      ].includes(`@${activeAccount.name}`),
    );
    if (hasAuthorizedAccountLinkedToActiveAccount) {
      warningMessage = 'popup_html_deleting_account_linked_to_authorized';
      warningParams = [activeAccount.name];
    }
    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage(
        'popup_html_delete_account_confirmation_message',
        [activeAccount.name!],
      ),
      title: 'popup_html_delete_account',
      warningMessage: warningMessage,
      warningParams: warningParams,
      afterConfirmAction: async () => {
        addToLoadingList('html_popup_delete_account_operation');
        let newAccounts = AccountUtils.deleteAccount(
          activeAccount.name!,
          accounts,
        );
        let no_key_check = await LocalStorageUtils.getValueFromLocalStorage(
          LocalStorageKeyEnum.NO_KEY_CHECK,
        );
        if (no_key_check && no_key_check.hasOwnProperty(activeAccount.name!)) {
          delete no_key_check[activeAccount.name!];
          if (Object.keys(no_key_check).length === 0) no_key_check = null;
          LocalStorageUtils.saveValueInLocalStorage(
            LocalStorageKeyEnum.NO_KEY_CHECK,
            no_key_check,
          );
        }
        let finalAccounts = [];
        if (hasAuthorizedAccountLinkedToActiveAccount) {
          for (let i = 0; i < newAccounts.length; i++) {
            let tmp = newAccounts[i];
            if (tmp.keys.activePubkey === `@${activeAccount.name}`) {
              delete tmp.keys.activePubkey;
              delete tmp.keys.active;
            }
            if (tmp.keys.postingPubkey === `@${activeAccount.name}`) {
              delete tmp.keys.posting;
              delete tmp.keys.postingPubkey;
            }
            if (tmp.keys.memoPubkey === `@${activeAccount.name}`) {
              delete tmp.keys.memo;
              delete tmp.keys.memoPubkey;
            }

            newAccounts[i] = tmp;

            if (Object.keys(newAccounts[i].keys).length > 0) {
              finalAccounts.push(newAccounts[i]);
            }
          }
        } else {
          finalAccounts = newAccounts;
        }

        setAccounts(finalAccounts);
        if (finalAccounts.length) {
          loadActiveAccount(finalAccounts[0]);
        }
        navigateTo(Screen.HOME_PAGE, true);
        removeFromLoadingList('html_popup_delete_account_operation');
      },
    });
  };

  const toggleQRCode = () => {
    setQRCodeDisplayed(!qrCodeDisplayed);
    setTimeout(() => {
      if (qrCodeRef && qrCodeRef.current) {
        qrCodeRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="account-keys-list">
      <div className="keys-panel">
        <AccountKeysListItemComponent
          privateKey={activeAccount.keys.active}
          publicKey={activeAccount.keys.activePubkey}
          keyName={'popup_html_active'}
          keyType={KeyType.ACTIVE}
          canDelete={canDeleteKey}
          isWrongKey={isWrongKey(KeychainKeyTypesLC.active)}
        />
        <AccountKeysListItemComponent
          privateKey={activeAccount.keys.posting}
          publicKey={activeAccount.keys.postingPubkey}
          keyName={'popup_html_posting'}
          keyType={KeyType.POSTING}
          canDelete={canDeleteKey}
          isWrongKey={isWrongKey(KeychainKeyTypesLC.posting)}
        />
        <AccountKeysListItemComponent
          privateKey={activeAccount.keys.memo}
          publicKey={activeAccount.keys.memoPubkey}
          keyName={'popup_html_memo'}
          keyType={KeyType.MEMO}
          canDelete={canDeleteKey}
          isWrongKey={isWrongKey(KeychainKeyTypesLC.memo)}
        />
      </div>

      <ButtonComponent
        dataTestId="button-toogle-qr-code"
        label={qrCodeDisplayed ? 'popup_html_hide_qr' : 'popup_html_show_qr'}
        onClick={() => toggleQRCode()}
      />
      {qrCodeDisplayed && (
        <>
          <p className="introduction">
            {chrome.i18n.getMessage('popup_html_qr_disclaimer1')}
            <br />
            <br />
            {chrome.i18n.getMessage('popup_html_qr_disclaimer2')}
          </p>
          <div ref={qrCodeRef}></div>
          <QRCode
            data-testid="qrcode"
            className="qrcode"
            value={`keychain://add_account=${AccountUtils.generateQRCode(
              account!,
            )}`}
          />
        </>
      )}

      {accounts.length > 1 && (
        <ButtonComponent
          dataTestId="button-delete-account"
          label="popup_html_delete_account"
          type={ButtonType.IMPORTANT}
          onClick={() => deleteAccount()}
        />
      )}
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
  navigateTo,
});
type PropsType = ConnectedProps<typeof connector>;

export const AccountKeysListComponent = connector(AccountKeysList);
