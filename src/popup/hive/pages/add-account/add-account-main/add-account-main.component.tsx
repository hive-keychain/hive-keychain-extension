import { BackgroundMessage } from '@background/multichain/background-message.interface';
import { Screen } from '@interfaces/screen.interface';
import { setEvmAccounts } from '@popup/evm/actions/accounts.actions';
import { loadEvmActiveAccount } from '@popup/evm/actions/active-account.actions';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { EvmWalletSetupTabUtils } from '@popup/evm/utils/evm-wallet-setup-tab.utils';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { setActiveAccountType } from '@popup/multichain/actions/active-account-type.actions';
import { resetChain, setChain } from '@popup/multichain/actions/chain.actions';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import {
  resetTitleContainerProperties,
  setTitleContainerProperties,
} from '@popup/multichain/actions/title-container.actions';
import {
  Chain,
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { MenuItemComponent } from 'src/common-ui/menu/menu-item/menu-item.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { MenuItem } from 'src/interfaces/menu-item.interface';
import { setAccounts } from 'src/popup/hive/actions/account.actions';
import { loadActiveAccount } from 'src/popup/hive/actions/active-account.actions';
import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const AddAccountMain = ({
  navigateTo,
  accounts,
  setAccounts,
  setTitleContainerProperties,
  resetTitleContainerProperties,
  isLedgerSupported,
  isEvmLedgerSupported,
  resetChain,
  setChain,
  chain,
  mk,
  loadActiveAccount,
  setActiveAccountType,
  loadEvmActiveAccount,
}: PropsFromRedux) => {
  const [selectedAccountType, setSelectedAccountType] = useState<
    ChainType.HIVE | ChainType.EVM
  >(ChainType.HIVE);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_setup',
      isBackButtonEnabled: true,
      onBackAdditional:
        !accounts || !accounts.length ? () => resetChain() : undefined,
      isCloseButtonDisabled: !accounts || !accounts.length,
    });
  }, []);

  const handleAddByKeys = (): void => {
    navigateTo(Screen.ACCOUNT_PAGE_ADD_BY_KEYS);
  };
  const handleAddByAuth = (): void => {
    navigateTo(Screen.ACCOUNT_PAGE_ADD_BY_AUTH);
  };
  const handleCreateHiveAccount = (): void => {
    navigateTo(Screen.CREATE_ACCOUNT_PAGE_STEP_ONE);
  };

  const resolveEvmAddAccountChain = async (): Promise<EvmChain | undefined> => {
    if (chain?.type === ChainType.EVM) {
      return chain as EvmChain;
    }

    return (
      (await EvmChainUtils.getLastEvmChain()) ??
      (await EvmChainUtils.getEthChain())
    );
  };

  const navigateToEvmSetupScreen = async (screen: Screen): Promise<void> => {
    const targetChain = await resolveEvmAddAccountChain();
    if (!targetChain) {
      return;
    }
    await setChain(targetChain);
    navigateTo(screen);
  };

  const handleCreateEvmWallet = async (): Promise<void> => {
    const targetChain = await resolveEvmAddAccountChain();
    if (!targetChain) {
      return;
    }
    await setChain(targetChain);
    EvmWalletSetupTabUtils.startEvmCreateWalletFromToolbarPopup(() => {
      navigateTo(Screen.CREATE_EVM_WALLET);
    });
  };

  const handleImportEvmWallet = (): void => {
    void navigateToEvmSetupScreen(Screen.IMPORT_EVM_WALLET);
  };

  const handleImportEvmWalletFromKey = (): void => {
    void navigateToEvmSetupScreen(Screen.IMPORT_EVM_WALLET_FROM_KEY);
  };

  const handleImportKeys = (): void => {
    chrome.windows.getCurrent(async (currentWindow) => {
      const win: chrome.windows.CreateData = {
        url: chrome.runtime.getURL('import-accounts.html'),
        type: 'popup',
        height: 600,
        width: 435,
        left: currentWindow.width! - 350 + currentWindow.left!,
        top: currentWindow.top,
      };
      // Except on Firefox
      //@ts-ignore
      if (typeof InstallTrigger === undefined) win.focused = true;
      const window = await chrome.windows.create(win);
      // setImportWindow(window.id);
      chrome.runtime.onMessage.addListener(onSentBackAccountsListener);
    });
  };

  const onSentBackAccountsListener = async (message: BackgroundMessage) => {
    if (message.command === BackgroundCommand.SEND_BACK_IMPORTED_ACCOUNTS) {
      if (
        !(typeof message.value === 'string') &&
        message.value?.success &&
        message.value?.accountType === 'evm'
      ) {
        const evmAccounts =
          await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk);
        setEvmAccounts(evmAccounts);
        if (chain?.type === ChainType.EVM && evmAccounts[0]) {
          await loadEvmActiveAccount(chain as EvmChain, evmAccounts[0].wallet);
        }
        resetTitleContainerProperties();
        navigateTo(Screen.HOME_PAGE, true);
        chrome.runtime.onMessage.removeListener(onSentBackAccountsListener);
        return;
      }

      if (
        !(typeof message.value === 'string') &&
        message.value?.accountType !== 'evm' &&
        message.value?.accounts.length
      ) {
        setAccounts(message.value.accounts);
        resetTitleContainerProperties();
        setActiveAccountType(ChainType.HIVE);
        loadActiveAccount(message.value.accounts[0]);
        navigateTo(Screen.HOME_PAGE, true);
      }
      chrome.runtime.onMessage.removeListener(onSentBackAccountsListener);
    }
  };

  const handleAddFromLedger = async () => {
    const extensionId = (await chrome.management.getSelf()).id;
    chrome.tabs.create({
      url: `chrome-extension://${extensionId}/add-accounts-from-ledger.html`,
    });
  };

  const handleAddEvmFromLedger = async () => {
    const targetChain = await resolveEvmAddAccountChain();
    if (!targetChain) {
      return;
    }
    await setChain(targetChain);
    const extensionId = (await chrome.management.getSelf()).id;
    chrome.tabs.create({
      url: `chrome-extension://${extensionId}/add-evm-accounts-from-ledger.html?chainId=${targetChain.chainId}`,
    });
  };

  const handleSetupKeylessKeychain = async () => {
    await LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.KEYLESS_KEYCHAIN_ENABLED,
      true,
    );
    navigateTo(Screen.ACCOUNT_PAGE_KEYLESS_KEYCHAIN);
  };

  const getAddAccountTypeCardClassName = (
    accountType: ChainType.HIVE | ChainType.EVM,
  ) => {
    const classNames = ['add-account-type-card'];
    if (selectedAccountType === accountType) {
      classNames.push('selected');
    }
    return classNames.join(' ');
  };

  const handleMenuItemClick = (menuItem: MenuItem) => {
    if (menuItem.nextScreen) {
      navigateTo(menuItem.nextScreen);
      return;
    }
    menuItem.action?.();
  };

  const renderAddAccountMenuItems = (menuItems: MenuItem[]) => (
    <div className="button-container menu">
      {menuItems.map((menuItem, index) => (
        <MenuItemComponent
          key={`${menuItem.label}-${index}`}
          menuItem={menuItem}
          handleMenuItemClick={handleMenuItemClick}
          isLast={index === menuItems.length - 1}
        />
      ))}
    </div>
  );

  const renderHiveAccountOptions = () => (
    <>
      <div
        className="caption"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('popup_html_chose_add_method'),
        }}></div>

      {renderAddAccountMenuItems([
        {
          icon: SVGIcons.MENU_ACCOUNTS_ADD_ACCOUNT,
          label: 'popup_html_add_by_keys',
          action: handleAddByKeys,
        },
        ...(accounts.length > 0
          ? [
              {
                icon: SVGIcons.MENU_ACCOUNTS_ADD_BY_AUTHORIZED_ACCOUNT,
                label: 'popup_html_add_by_auth',
                action: handleAddByAuth,
              },
              {
                icon: SVGIcons.MENU_ACCOUNTS_CREATE_ACCOUNT,
                label: 'popup_html_create_account',
                action: handleCreateHiveAccount,
              },
            ]
          : []),

        ...(isLedgerSupported
          ? [
              {
                icon: SVGIcons.MENU_ADVANCED_SETTINGS_LINK_LEDGER_DEVICE,
                label: 'popup_html_add_account_with_ledger',
                action: handleAddFromLedger,
              },
            ]
          : []),
        ...(accounts.length === 0
          ? [
              {
                icon: SVGIcons.KEYCHAIN_LOGO_ROUND_SMALL,
                label: 'popup_html_setup_keyless_keychain',
                action: handleSetupKeylessKeychain,
              },
            ]
          : []),
        {
          icon: SVGIcons.MENU_ACCOUNTS_IMPORT,
          label: 'popup_html_import_keys',
          action: handleImportKeys,
        },
      ])}
    </>
  );

  const renderEvmAccountOptions = () => (
    <>
      <div
        className="caption"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('html_popup_evm_add_wallet_method'),
        }}></div>

      {renderAddAccountMenuItems([
        {
          icon: SVGIcons.MENU_ACCOUNTS_ADD_ACCOUNT,
          label: 'html_popup_evm_import_wallet',
          action: handleImportEvmWallet,
        },

        {
          icon: SVGIcons.MENU_ACCOUNTS_IMPORT_KEY,
          label: 'popup_html_import_wallet_from_key',
          action: handleImportEvmWalletFromKey,
        },
        {
          icon: SVGIcons.MENU_ACCOUNTS_CREATE_ACCOUNT,
          label: 'html_popup_evm_create_wallet',
          action: () => void handleCreateEvmWallet(),
        },
        ...(isEvmLedgerSupported
          ? [
              {
                icon: SVGIcons.MENU_ADVANCED_SETTINGS_LINK_LEDGER_DEVICE,
                label: 'popup_html_add_account_with_ledger',
                action: () => void handleAddEvmFromLedger(),
              },
            ]
          : []),
        {
          icon: SVGIcons.MENU_ACCOUNTS_IMPORT,
          label: 'popup_html_import_keys',
          action: handleImportKeys,
        },
      ])}
    </>
  );

  return (
    <div
      className="add-account-page"
      data-testid={`${Screen.ACCOUNT_PAGE_INIT_ACCOUNT}-page`}>
      <div className="add-account-type-selector">
        <button
          className={getAddAccountTypeCardClassName(ChainType.HIVE)}
          data-testid="add-account-type-hive"
          onClick={() => setSelectedAccountType(ChainType.HIVE)}
          type="button">
          <SVGIcon icon={SVGIcons.BLOCKCHAIN_HIVE} className="hive-icon" />
          <span>{ChainType.HIVE}</span>
        </button>
        <button
          className={getAddAccountTypeCardClassName(ChainType.EVM)}
          data-testid="add-account-type-evm"
          onClick={() => setSelectedAccountType(ChainType.EVM)}
          type="button">
          <SVGIcon icon={SVGIcons.BLOCKCHAIN_ETHEREUM} />
          <span>{ChainType.EVM}</span>
        </button>
      </div>
      {selectedAccountType === ChainType.HIVE
        ? renderHiveAccountOptions()
        : renderEvmAccountOptions()}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    accounts: state.hive.accounts,
    isLedgerSupported: state.hive.appStatus.isLedgerSupported,
    isEvmLedgerSupported: state.evm.appStatus.isLedgerSupported,
    chain: state.chain as Chain,
    mk: state.mk,
  };
};

const connector = connect(mapStateToProps, {
  navigateTo,
  setEvmAccounts,
  setAccounts,
  setTitleContainerProperties,
  resetTitleContainerProperties,
  resetChain,
  setChain,
  loadActiveAccount,
  setActiveAccountType,
  loadEvmActiveAccount,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AddAccountMainComponent = connector(AddAccountMain);
