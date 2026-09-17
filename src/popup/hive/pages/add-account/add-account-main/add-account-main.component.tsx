import { Screen } from '@interfaces/screen.interface';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { EvmWalletSetupTabUtils } from '@popup/evm/utils/evm-wallet-setup-tab.utils';
import ImportAccountsFileUtils from '@popup/hive/utils/import-accounts-file.utils';
import { setChain } from '@popup/multichain/actions/chain.actions';
import {
  navigateTo,
  navigateToWithParams,
} from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import {
  Chain,
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import { LedgerRouteUtils } from '@popup/multichain/utils/ledger-route.utils';
import { GuidedTourTarget } from '@reference-data/guided-tour.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { buildAddAccountSetupTitleProperties } from 'src/popup/hive/pages/add-account/add-account-setup-title.utils';
import React, { useLayoutEffect, useEffect, useState } from 'react';
import { ConnectedProps, connect, useStore } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { MenuItemComponent } from 'src/common-ui/menu/menu-item/menu-item.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { MenuItem } from 'src/interfaces/menu-item.interface';
import { HtmlUtils } from 'src/utils/html.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

interface AddAccountNavigationParams {
  selectedAccountType?: ChainType;
}

const getInitialSelectedAccountType = (
  navigationParams?: AddAccountNavigationParams,
  chain?: Chain,
): ChainType.HIVE | ChainType.EVM => {
  return navigationParams?.selectedAccountType === ChainType.EVM ||
    chain?.type === ChainType.EVM
    ? ChainType.EVM
    : ChainType.HIVE;
};

const AddAccountMain = ({
  navigateTo,
  navigateToWithParams,
  accounts,
  evmAccountsCount,
  setTitleContainerProperties,
  isLedgerSupported,
  isEvmLedgerSupported,
  setChain,
  chain,
  navigationParams,
}: PropsFromRedux) => {
  const reduxStore = useStore<RootState>();
  const [selectedAccountType, setSelectedAccountType] = useState<
    ChainType.HIVE | ChainType.EVM
  >(getInitialSelectedAccountType(navigationParams, chain));
  const isLedgerAvailableForEvm = isEvmLedgerSupported || isLedgerSupported;

  const canLeaveAddAccountPage =
    (accounts?.length ?? 0) + evmAccountsCount > 0;

  useEffect(() => {
    setSelectedAccountType(
      getInitialSelectedAccountType(navigationParams, chain),
    );
  }, [chain, navigationParams]);

  useLayoutEffect(() => {
    setTitleContainerProperties(
      buildAddAccountSetupTitleProperties(canLeaveAddAccountPage),
    );
  }, [canLeaveAddAccountPage, setTitleContainerProperties]);

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
    navigateToWithParams(screen, { selectedAccountType: ChainType.EVM });
  };

  const handleCreateEvmWallet = async (): Promise<void> => {
    const targetChain = await resolveEvmAddAccountChain();
    if (!targetChain) {
      return;
    }
    await setChain(targetChain);
    EvmWalletSetupTabUtils.startEvmCreateWalletFromToolbarPopup(() => {
      navigateToWithParams(Screen.CREATE_EVM_WALLET, {
        selectedAccountType: ChainType.EVM,
      });
    });
  };

  const handleImportEvmWallet = (): void => {
    void navigateToEvmSetupScreen(Screen.IMPORT_EVM_WALLET);
  };

  const handleImportEvmWalletFromKey = (): void => {
    void navigateToEvmSetupScreen(Screen.IMPORT_EVM_WALLET_FROM_KEY);
  };

  const handleImportKeys = (): void => {
    ImportAccountsFileUtils.startImportAccountsFromFile(reduxStore);
  };

  const handleAddFromLedger = async () => {
    if (
      await LedgerRouteUtils.openInSidePanelFromToolbarPopup(
        LedgerRouteUtils.ADD_HIVE_ACCOUNTS_HASH,
      )
    ) {
      return;
    }
    navigateTo(Screen.ACCOUNT_PAGE_ADD_ACCOUNTS_FROM_LEDGER);
  };

  const handleAddEvmFromLedger = async () => {
    if (
      await LedgerRouteUtils.openInSidePanelFromToolbarPopup(
        LedgerRouteUtils.ADD_EVM_ACCOUNTS_HASH,
      )
    ) {
      return;
    }
    const targetChain = await resolveEvmAddAccountChain();
    if (!targetChain) {
      return;
    }
    await setChain(targetChain);
    navigateToWithParams(Screen.EVM_ADD_ACCOUNTS_FROM_LEDGER, {
      selectedAccountType: ChainType.EVM,
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

  const handleMenuItemClick = async (menuItem: MenuItem) => {
    if (
      menuItem.sidePanelHash &&
      (await LedgerRouteUtils.openInSidePanelFromToolbarPopup(
        menuItem.sidePanelHash,
      ))
    ) {
      return;
    }
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
          __html: HtmlUtils.getSafeI18nHtml('popup_html_chose_add_method'),
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
                sidePanelHash: LedgerRouteUtils.ADD_HIVE_ACCOUNTS_HASH,
              },
            ]
          : []),
        ...(accounts.length === 0
          ? [
              {
                icon: SVGIcons.MENU_ACCOUNTS_KEYLESS_KEYCHAIN,
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
          __html: HtmlUtils.getSafeI18nHtml('html_popup_evm_add_wallet_method'),
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
        ...(isLedgerAvailableForEvm
          ? [
              {
                icon: SVGIcons.MENU_ADVANCED_SETTINGS_LINK_LEDGER_DEVICE,
                label: 'popup_html_add_account_with_ledger',
                action: () => void handleAddEvmFromLedger(),
                sidePanelHash: LedgerRouteUtils.ADD_EVM_ACCOUNTS_HASH,
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
          data-guided-tour={GuidedTourTarget.ADD_ACCOUNT_TYPE_EVM}
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
    evmAccountsCount: state.evm.accounts.length,
    isLedgerSupported: state.hive.appStatus.isLedgerSupported,
    isEvmLedgerSupported: state.evm.appStatus.isLedgerSupported,
    chain: state.chain as Chain,
    navigationParams: (state.navigation.stack[0]?.params ??
      state.navigation.stack[0]?.previousParams) as
      | AddAccountNavigationParams
      | undefined,
  };
};

const connector = connect(mapStateToProps, {
  navigateTo,
  navigateToWithParams,
  setTitleContainerProperties,
  setChain,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AddAccountMainComponent = connector(AddAccountMain);
