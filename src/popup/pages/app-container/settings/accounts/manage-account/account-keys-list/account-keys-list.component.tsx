import { setAccounts } from '@popup/actions/account.actions';
import { loadActiveAccount } from '@popup/actions/active-account.actions';
import { setLoading } from '@popup/actions/loading.actions';
import { navigateToWithParams } from '@popup/actions/navigation.actions';
import { AccountKeysListItemComponent } from '@popup/pages/app-container/settings/accounts/manage-account/account-keys-list/account-keys-list-item/account-keys-list-item.component';
import { RootState } from '@popup/store';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { KeyType } from 'src/interfaces/keys.interface';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import AccountUtils from 'src/utils/account.utils';
import './account-keys-list.component.scss';

const AccountKeysList = ({
  activeAccount,
  accounts,
  setAccounts,
  loadActiveAccount,
  navigateToWithParams,
  setLoading,
}: PropsType) => {
  const [qrCodeDisplayed, setQRCodeDisplayed] = useState(false);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    setAccount(
      accounts.find(
        (account: LocalAccount) => account.name === activeAccount.name,
      ),
    );
  }, [activeAccount]);

  const deleteAccount = () => {
    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage(
        'popup_html_delete_account_confirmation_message',
        [activeAccount.name!],
      ),
      afterConfirmAction: async () => {
        setLoading(true);
        const newAccounts = AccountUtils.deleteAccount(
          activeAccount.name!,
          accounts,
        );
        setAccounts(newAccounts);
        loadActiveAccount(newAccounts[0], true);
        setLoading(false);
      },
    });
  };

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

      <ButtonComponent
        label={qrCodeDisplayed ? 'popup_html_hide_qr' : 'popup_html_show_qr'}
        onClick={() => setQRCodeDisplayed(!qrCodeDisplayed)}
      />
      {qrCodeDisplayed && (
        <QRCode
          className="qrcode"
          value={`keychain://add_account=${JSON.stringify(account)}`}
        />
      )}

      {accounts.length > 1 && (
        <ButtonComponent
          label="popup_html_delete_account"
          important={true}
          onClick={() => deleteAccount()}
        />
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { activeAccount: state.activeAccount, accounts: state.accounts };
};

const connector = connect(mapStateToProps, {
  setAccounts,
  loadActiveAccount,
  navigateToWithParams,
  setLoading,
});
type PropsType = ConnectedProps<typeof connector>;

export const AccountKeysListComponent = connector(AccountKeysList);
