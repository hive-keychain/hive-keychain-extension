import { Screen } from '@interfaces/screen.interface';
import { loadEvmActiveAccount } from '@popup/evm/actions/active-account.actions';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { setAccounts } from '@popup/hive/actions/account.actions';
import {
  loadActiveAccount,
  resetActiveAccount,
} from '@popup/hive/actions/active-account.actions';
import { AccountKeysListItemComponent } from '@popup/hive/pages/app-container/settings/accounts/manage-account/account-keys-list/account-keys-list-item/account-keys-list-item.component';
import { WrongKeysOnUser } from '@popup/hive/pages/app-container/wrong-key-popup/wrong-key-popup.component';
import { setActiveAccountType } from '@popup/multichain/actions/active-account-type.actions';
import { setChain } from '@popup/multichain/actions/chain.actions';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/multichain/actions/loading.actions';
import {
  navigateTo,
  navigateToWithParams,
} from '@popup/multichain/actions/navigation.actions';
import { resetKeychain } from '@popup/multichain/actions/reset-keychain.actions';
import {
  Chain,
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { KeychainKeyTypesLC } from 'hive-keychain-commons';
import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { CheckboxPanelComponent } from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { HiveConfirmationPageParams } from 'src/common-ui/confirmation-page/confirmation-page.interface';
import { KeyType } from 'src/interfaces/keys.interface';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import { KeysUtils } from 'src/popup/hive/utils/keys.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

import { I18nUtils } from 'src/utils/i18n.utils';
interface AccountKeysListProps {
  selectedAccountName: string;
  onAccountSelected: (accountName: string) => void;
  wrongKeysFound?: WrongKeysOnUser;
}

const AccountKeysList = ({
  selectedAccountName,
  onAccountSelected,
  wrongKeysFound,
  accounts,
  evmAccounts,
  mk,
  chain,
  setAccounts,
  loadActiveAccount,
  resetActiveAccount,
  navigateToWithParams,
  navigateTo,
  addToLoadingList,
  removeFromLoadingList,
  resetKeychain,
  setActiveAccountType,
  setChain,
  loadEvmActiveAccount,
}: PropsType & AccountKeysListProps) => {
  const [qrCodeDisplayed, setQRCodeDisplayed] = useState(false);
  const [account, setAccount] = useState<LocalAccount>();
  const [canDeleteKey, setCanDeleteKey] = useState(true);

  const [check1, setCheck1] = useState<boolean>(false);
  const [check2, setCheck2] = useState<boolean>(false);
  const [showQR, setShowQR] = useState<boolean>(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const selectedLocalAccount = accounts.find(
    (account: LocalAccount) => account.name === selectedAccountName,
  );
  const selectedAccountKeys = selectedLocalAccount?.keys;

  useEffect(() => {
    setQRCodeDisplayed(false);
    const acc = accounts.find(
      (account: LocalAccount) => account.name === selectedAccountName,
    );
    setAccount(acc!);
    setCanDeleteKey(KeysUtils.keysCount(acc?.keys ?? {}) > 2);
  }, [selectedAccountName, accounts]);

  const isWrongKey = (keyType: KeychainKeyTypesLC) => {
    return (
      wrongKeysFound &&
      wrongKeysFound[selectedAccountName] &&
      !!wrongKeysFound[selectedAccountName].find(
        (keyFound) => keyFound === keyType,
      )
    );
  };

  const openRemainingEvmAccount = async (remainingEvmAccounts: EvmAccount[]) => {
    const nextAccount =
      remainingEvmAccounts.find((evmAccount) => !evmAccount.hide) ??
      remainingEvmAccounts[0];
    if (!nextAccount) return;

    const currentChain =
      chain?.type === ChainType.EVM ? (chain as EvmChain) : undefined;
    const evmChain =
      currentChain ??
      (await EvmChainUtils.getLastEvmChain()) ??
      (await EvmChainUtils.getEthChain());
    if (!evmChain) return;

    setActiveAccountType(ChainType.EVM);
    await setChain(evmChain);
    await loadEvmActiveAccount(evmChain, nextAccount.wallet);
  };

  const deleteAccount = () => {
    const accountsAfterRemoval = AccountUtils.getAccountsAfterAccountRemoval(
      selectedAccountName,
      accounts,
    );
    const isLastAccountOnKeychain =
      accountsAfterRemoval.length === 0 && evmAccounts.length === 0;
    const hasAuthorizedAccountLinkedToActiveAccount = accounts.some((account) =>
      [
        account.keys.activePubkey,
        account.keys.memoPubkey,
        account.keys.postingPubkey,
      ].includes(`@${selectedAccountName}`),
    );
    let warningMessage: string | undefined;
    let warningParams: string[] | undefined;
    const confirmationMessage = I18nUtils.getMessage(
      'popup_html_delete_account_confirmation_message',
      [selectedAccountName],
    );
    const message = isLastAccountOnKeychain
      ? `${confirmationMessage}<span class="reset-keychain-warning">${I18nUtils.getMessage(
          'popup_html_delete_last_account_reset_warning',
        )}</span>`
      : confirmationMessage;
    if (hasAuthorizedAccountLinkedToActiveAccount && !isLastAccountOnKeychain) {
      warningMessage = 'popup_html_deleting_account_linked_to_authorized';
      warningParams = [selectedAccountName];
    }
    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      method: null,
      fields: [],
      message,
      title: 'popup_html_delete_account',
      warningMessage: warningMessage,
      warningParams: warningParams,
      afterConfirmAction: async () => {
        addToLoadingList('html_popup_delete_account_operation');
        if (isLastAccountOnKeychain) {
          await resetKeychain();
          navigateTo(Screen.SIGN_UP_PAGE, true);
          removeFromLoadingList('html_popup_delete_account_operation');
          return;
        }

        let no_key_check = await LocalStorageUtils.getValueFromLocalStorage(
          LocalStorageKeyEnum.NO_KEY_CHECK,
        );
        if (no_key_check && no_key_check.hasOwnProperty(selectedAccountName)) {
          delete no_key_check[selectedAccountName];
          if (Object.keys(no_key_check).length === 0) no_key_check = null;
          LocalStorageUtils.saveValueInLocalStorage(
            LocalStorageKeyEnum.NO_KEY_CHECK,
            no_key_check,
          );
        }

        if (accountsAfterRemoval.length === 0) {
          try {
            await openRemainingEvmAccount(evmAccounts);
          } catch (error) {
            Logger.error(
              'Failed to switch to the remaining EVM account',
              error,
            );
          }
          await AccountUtils.saveAccounts([], mk);
          resetActiveAccount();
          setAccounts([]);
        } else {
          setAccounts(accountsAfterRemoval);
          loadActiveAccount(accountsAfterRemoval[0]);
        }
        navigateTo(Screen.HOME_PAGE, true);
        removeFromLoadingList('html_popup_delete_account_operation');
      },
    } as HiveConfirmationPageParams);
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
          selectedAccountName={selectedAccountName}
          onAccountSelected={onAccountSelected}
          privateKey={selectedAccountKeys?.active}
          publicKey={selectedAccountKeys?.activePubkey}
          keyName={'popup_html_active'}
          keyType={KeyType.ACTIVE}
          canDelete={canDeleteKey}
          isWrongKey={isWrongKey(KeychainKeyTypesLC.active)}
        />
        <AccountKeysListItemComponent
          selectedAccountName={selectedAccountName}
          onAccountSelected={onAccountSelected}
          privateKey={selectedAccountKeys?.posting}
          publicKey={selectedAccountKeys?.postingPubkey}
          keyName={'popup_html_posting'}
          keyType={KeyType.POSTING}
          canDelete={canDeleteKey}
          isWrongKey={isWrongKey(KeychainKeyTypesLC.posting)}
        />
        <AccountKeysListItemComponent
          selectedAccountName={selectedAccountName}
          onAccountSelected={onAccountSelected}
          privateKey={selectedAccountKeys?.memo}
          publicKey={selectedAccountKeys?.memoPubkey}
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
        type={ButtonType.ALTERNATIVE}
      />
      {qrCodeDisplayed && (
        <div className="qr-code">
          <div className="overlay"></div>
          <div className="qr-code-popup">
            <div>
              <h3>{I18nUtils.getMessage('popup_html_qr_title')}</h3>
              <div className="qr-code-disclaimer">
                <span>
                  {I18nUtils.getMessage('popup_html_qr_disclaimer1') + ' '}
                </span>
                <span>
                  {I18nUtils.getMessage('popup_html_qr_disclaimer2')}
                </span>
              </div>
            </div>
            {!showQR ? (
              <div>
                <div className="qr-code-popup-checkbox-container">
                  <CheckboxPanelComponent
                    text="popup_html_qr_check1"
                    onChange={(checked) => {
                      setCheck1(checked);
                    }}
                    checked={check1}
                  />
                  <CheckboxPanelComponent
                    text="popup_html_qr_check2"
                    onChange={(checked) => {
                      setCheck2(checked);
                    }}
                    checked={check2}
                  />
                </div>
                <div className="submit-button-container">
                  <ButtonComponent
                    label="popup_html_qr_exported_show_button"
                    onClick={() => {
                      if (check1 && check2) setShowQR(true);
                    }}
                    type={ButtonType.IMPORTANT}
                  />
                </div>
              </div>
            ) : (
              <div>
                <div className="qr-code-container">
                  <div ref={qrCodeRef}></div>
                  <QRCode
                    data-testid="qrcode"
                    className="qrcode"
                    size={240}
                    value={`keychain://add_account=${JSON.stringify(
                      AccountUtils.generateQRCode(account!),
                    )}`}
                    bgColor="var(--qrcode-background-color)"
                    fgColor="var(--qrcode-foreground-color)"
                  />
                </div>
                <ButtonComponent
                  label="popup_html_close"
                  onClick={() => setQRCodeDisplayed(false)}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <ButtonComponent
        dataTestId="button-delete-account"
        label="popup_html_delete_account"
        type={ButtonType.IMPORTANT}
        onClick={() => deleteAccount()}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    accounts: state.hive.accounts as LocalAccount[],
    evmAccounts: state.evm.accounts as EvmAccount[],
    mk: state.mk,
    chain: state.chain as Chain,
  };
};

const connector = connect(mapStateToProps, {
  setAccounts,
  loadActiveAccount,
  resetActiveAccount,
  navigateToWithParams,
  addToLoadingList,
  removeFromLoadingList,
  navigateTo,
  resetKeychain,
  setActiveAccountType,
  setChain,
  loadEvmActiveAccount,
});
type PropsType = ConnectedProps<typeof connector>;

export const AccountKeysListComponent = connector(AccountKeysList);
