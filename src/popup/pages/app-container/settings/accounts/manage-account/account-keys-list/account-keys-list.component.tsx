import { setAccounts } from '@popup/actions/account.actions';
import { loadActiveAccount } from '@popup/actions/active-account.actions';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/actions/loading.actions';
import { navigateToWithParams } from '@popup/actions/navigation.actions';
import { AccountKeysListItemComponent } from '@popup/pages/app-container/settings/accounts/manage-account/account-keys-list/account-keys-list-item/account-keys-list-item.component';
import { RootState } from '@popup/store';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { KeyType } from 'src/interfaces/keys.interface';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import AccountUtils from 'src/utils/account.utils';
import { KeysUtils } from 'src/utils/keys.utils';
import './account-keys-list.component.scss';

const AccountKeysList = ({
  activeAccount,
  accounts,
  setAccounts,
  loadActiveAccount,
  navigateToWithParams,
  addToLoadingList,
  removeFromLoadingList,
}: PropsType) => {
  const [qrCodeDisplayed, setQRCodeDisplayed] = useState(false);
  const [account, setAccount] = useState<LocalAccount>();
  const [canDeleteKey, setCanDeleteKey] = useState(true);

  const qrCodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const account = accounts.find(
      (account: LocalAccount) => account.name === activeAccount.name,
    );
    setAccount(account!);
    setCanDeleteKey(KeysUtils.keysCount(activeAccount.keys) > 2);
  }, [activeAccount]);

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
        console.log('After deleting: ', finalAccounts);
        setAccounts(finalAccounts);
        if (finalAccounts.length) {
          loadActiveAccount(finalAccounts[0]);
        }
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
          privateKey={activeAccount.keys.posting}
          publicKey={activeAccount.keys.postingPubkey}
          keyName={'popup_html_posting'}
          keyType={KeyType.POSTING}
          canDelete={canDeleteKey}
        />
        <AccountKeysListItemComponent
          privateKey={activeAccount.keys.active}
          publicKey={activeAccount.keys.activePubkey}
          keyName={'popup_html_active'}
          keyType={KeyType.ACTIVE}
          canDelete={canDeleteKey}
        />
        <AccountKeysListItemComponent
          privateKey={activeAccount.keys.memo}
          publicKey={activeAccount.keys.memoPubkey}
          keyName={'popup_html_memo'}
          keyType={KeyType.MEMO}
          canDelete={canDeleteKey}
        />
      </div>

      <ButtonComponent
        ariaLabel="button-toogle-qr-code"
        label={qrCodeDisplayed ? 'popup_html_hide_qr' : 'popup_html_show_qr'}
        onClick={() => toggleQRCode()}
      />
      {qrCodeDisplayed && (
        <>
          <div ref={qrCodeRef}></div>
          <QRCode
            aria-label="qrcode"
            className="qrcode"
            value={`keychain://add_account=${JSON.stringify(account)}`}
          />
        </>
      )}

      {accounts.length > 1 && (
        <ButtonComponent
          ariaLabel="button-delete-account"
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
});
type PropsType = ConnectedProps<typeof connector>;

export const AccountKeysListComponent = connector(AccountKeysList);
