import { BackgroundMessage } from '@background/multichain/background-message.interface';
import { Screen } from '@interfaces/screen.interface';
import { setEvmAccounts } from '@popup/evm/actions/accounts.actions';
import { loadEvmActiveAccount } from '@popup/evm/actions/active-account.actions';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { setAccounts } from '@popup/hive/actions/account.actions';
import { loadActiveAccount } from '@popup/hive/actions/active-account.actions';
import { setActiveAccountType } from '@popup/multichain/actions/active-account-type.actions';
import { setErrorMessage, setSuccessMessage } from '@popup/multichain/actions/message.actions';
import { goBack, navigateTo } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { Chain, ChainType, EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useRef } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import FileUtils from 'src/utils/file.utils';
import { CommunicationUtils } from 'src/utils/communication.utils';

const ImportKeys = ({
  mk,
  chain,
  setTitleContainerProperties,
  setAccounts,
  setEvmAccounts,
  setActiveAccountType,
  loadActiveAccount,
  loadEvmActiveAccount,
  navigateTo,
  goBack,
  setSuccessMessage,
  setErrorMessage,
}: PropsFromRedux) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_import_keys',
      isBackButtonEnabled: true,
    });
  }, []);

  useEffect(() => {
    inputRef.current?.click();
  }, []);

  useEffect(() => {
    const onSentBackAccountsListener = (message: BackgroundMessage) => {
      if (message.command !== BackgroundCommand.SEND_BACK_IMPORTED_ACCOUNTS) {
        return;
      }

      void (async () => {
        if (
          !(typeof message.value === 'string') &&
          message.value?.success &&
          message.value?.accountType === 'all'
        ) {
          const hiveAccounts =
            message.value?.accounts?.length > 0
              ? message.value.accounts
              : ((await AccountUtils.getAccountsFromLocalStorage(mk)) ?? []);
          EvmWalletUtils.invalidateRebuildAccountsCache();
          const evmAccounts = await EvmWalletUtils.rebuildAccountsFromLocalStorage(
            mk,
          );
          setAccounts(hiveAccounts);
          setEvmAccounts(evmAccounts);
          if (hiveAccounts[0]) {
            setActiveAccountType(ChainType.HIVE);
            loadActiveAccount(hiveAccounts[0]);
          }
          if (chain?.type === ChainType.EVM && evmAccounts[0]) {
            await loadEvmActiveAccount(chain as EvmChain, evmAccounts[0].wallet);
          }
          setSuccessMessage('import_html_success');
          navigateTo(Screen.HOME_PAGE, true);
          return;
        }

        if (
          !(typeof message.value === 'string') &&
          message.value?.success &&
          message.value?.accountType === 'evm'
        ) {
          EvmWalletUtils.invalidateRebuildAccountsCache();
          const evmAccounts = await EvmWalletUtils.rebuildAccountsFromLocalStorage(
            mk,
          );
          setEvmAccounts(evmAccounts);
          if (chain?.type === ChainType.EVM && evmAccounts[0]) {
            await loadEvmActiveAccount(chain as EvmChain, evmAccounts[0].wallet);
          }
          setSuccessMessage('import_html_success');
          navigateTo(Screen.HOME_PAGE, true);
          return;
        }

        if (
          !(typeof message.value === 'string') &&
          message.value?.accountType !== 'evm' &&
          message.value?.accounts?.length
        ) {
          setAccounts(message.value.accounts);
          setActiveAccountType(ChainType.HIVE);
          loadActiveAccount(message.value.accounts[0]);
          setSuccessMessage('import_html_success');
          navigateTo(Screen.HOME_PAGE, true);
          return;
        }

        if (typeof message.value === 'string') {
          setErrorMessage(message.value);
        } else {
          setErrorMessage(
            message.value?.warning?.message ??
              message.value?.feedback?.message ??
              'import_html_error',
          );
        }
      })();
    };

    chrome.runtime.onMessage.addListener(onSentBackAccountsListener);
    return () => {
      chrome.runtime.onMessage.removeListener(onSentBackAccountsListener);
    };
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      goBack();
      return;
    }
    const base64 = await FileUtils.toBase64(selectedFile);
    const fileData = atob(base64);
    CommunicationUtils.runtimeSendMessage({
      command: BackgroundCommand.IMPORT_ACCOUNTS,
      value: fileData,
    });
  };

  return (
    <div
      className="import-keys-page"
      data-testid={`${Screen.ACCOUNT_PAGE_IMPORT_KEYS}-page`}>
      <input
        ref={inputRef}
        type="file"
        accept=".kc"
        style={{ display: 'none' }}
        onChange={(event) => void handleFileUpload(event)}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    mk: state.mk,
    chain: state.chain as Chain,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  setAccounts,
  setEvmAccounts,
  setActiveAccountType,
  loadActiveAccount,
  loadEvmActiveAccount,
  navigateTo,
  goBack,
  setSuccessMessage,
  setErrorMessage,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ImportKeysComponent = connector(ImportKeys);
