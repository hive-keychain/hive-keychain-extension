import { Screen } from '@interfaces/screen.interface';
import { resetChain, setChain } from '@popup/multichain/actions/chain.actions';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { PageTitleProps } from 'src/common-ui/page-title/page-title.component';

const AddWalletMain = ({
  navigateTo,
  setTitleContainerProperties,
  hasFinishedSignup,
  chain,
  resetChain,
  setChain,
  resetOnBack,
}: PropsFromRedux) => {
  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    let titleProperties = {
      title: 'popup_html_setup',
      isBackButtonEnabled: true,
      isCloseButtonDisabled: true,
    } as PageTitleProps;

    if (resetOnBack) {
      titleProperties = {
        ...titleProperties,
        onBackAdditional: () => resetChain(),
      };
    }
    setTitleContainerProperties(titleProperties);
  };

  const handleCreateEvmWallet = (): void => {
    navigateTo(Screen.CREATE_EVM_WALLET);
  };
  const handleImportEvmWallet = (): void => {
    navigateTo(Screen.IMPORT_EVM_WALLET);
  };

  // const handleImportKeys = (): void => {
  //   chrome.windows.getCurrent(async (currentWindow) => {
  //     const win: chrome.windows.CreateData = {
  //       url: chrome.runtime.getURL('import-accounts.html'),
  //       type: 'popup',
  //       height: 600,
  //       width: 435,
  //       left: currentWindow.width! - 350 + currentWindow.left!,
  //       top: currentWindow.top,
  //     };
  //     // Except on Firefox
  //     //@ts-ignore
  //     if (typeof InstallTrigger === undefined) win.focused = true;
  //     const window = await chrome.windows.create(win);
  //     // setImportWindow(window.id);
  //     chrome.runtime.onMessage.addListener(onSentBackAccountsListener);
  //   });
  // };

  // const onSentBackAccountsListener = (message: BackgroundMessage) => {
  //   if (message.command === BackgroundCommand.SEND_BACK_IMPORTED_ACCOUNTS) {
  //     if (
  //       !(typeof message.value === 'string') &&
  //       message.value?.accounts.length
  //     ) {
  //       setAccounts(message.value.accounts);
  //     }
  //     chrome.runtime.onMessage.removeListener(onSentBackAccountsListener);
  //   }
  // };

  // const handleAddFromLedger = async () => {
  //   const extensionId = (await chrome.management.getSelf()).id;
  //   chrome.tabs.create({
  //     url: `chrome-extension://${extensionId}/add-accounts-from-ledger.html`,
  //   });
  // };

  return (
    <div
      className="add-account-page"
      data-testid={`${Screen.EVM_ADD_WALLET_MAIN}-page`}>
      <div
        className="caption"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('html_popup_evm_add_wallet_method'),
        }}></div>

      <div className="button-container">
        <ButtonComponent
          dataTestId="import-evm-wallet-button"
          label={'html_popup_evm_import_wallet'}
          onClick={handleImportEvmWallet}
          type={ButtonType.ALTERNATIVE}
        />
        <ButtonComponent
          dataTestId="create-evm-wallet-button"
          label={'html_popup_evm_create_wallet'}
          onClick={handleCreateEvmWallet}
          type={ButtonType.ALTERNATIVE}
        />
        {/* <ButtonComponent
          dataTestId="import-keys-button"
          label={'popup_html_import_keys'}
          onClick={handleImportKeys}
          type={ButtonType.ALTERNATIVE}
        /> */}
        {/* {isLedgerSupported && (
          <ButtonComponent
            dataTestId="import-keys-button"
            label={'popup_html_add_account_with_ledger'}
            onClick={handleAddFromLedger}
            type={ButtonType.ALTERNATIVE}
          />
        )} */}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    hasFinishedSignup: state.hasFinishedSignup,
    chain: state.chain,
    resetOnBack: state.navigation.stack[0]?.params?.resetOnBack,
  };
};

const connector = connect(mapStateToProps, {
  navigateTo,
  setTitleContainerProperties,
  resetChain,
  setChain,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AddWalletMainComponent = connector(AddWalletMain);
