import { Separator } from '@common-ui/separator/separator.component';
import { AccountSelectorOrderRef } from '@interfaces/account-selector-order.interface';
import { Screen } from '@interfaces/screen.interface';
import { setEvmAccounts } from '@popup/evm/actions/accounts.actions';
import { loadEvmActiveAccount } from '@popup/evm/actions/active-account.actions';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmAccountUtils } from '@popup/evm/utils/evm-account.utils';
import { EvmActiveAccountInitUtils } from '@popup/evm/utils/evm-active-account-init.utils';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { setAccounts } from '@popup/hive/actions/account.actions';
import { loadActiveAccount } from '@popup/hive/actions/active-account.actions';
import { HiveScreen } from '@popup/hive/reference-data/hive-screen.enum';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import { setActiveAccountType } from '@popup/multichain/actions/active-account-type.actions';
import { setChain } from '@popup/multichain/actions/chain.actions';
import { navigateToWithParams } from '@popup/multichain/actions/navigation.actions';
import {
  Chain,
  ChainType,
  EvmChain,
  HiveChain,
} from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import AccountSelectorOrderUtils, {
  AccountSelectorListItem,
} from '@popup/multichain/utils/account-selector-order.utils';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import React, { useEffect, useRef, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { ChainLogo } from 'src/common-ui/chain-logo/chain-logo.component';
import { EvmAccountImage } from 'src/common-ui/evm/evm-account-image/evm-account-image.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import {
  SortableDragHandleRef,
  SortableListComponent,
} from 'src/common-ui/sortable-list/sortable-list.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import {
  COPY_GENERIC_MESSAGE_KEY,
  copyTextWithToast,
} from 'src/common-ui/toast/copy-toast.utils';
import { ActiveAccount } from 'src/interfaces/active-account.interface';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import { MANAGE_ACCOUNT_SELECTED_NAME_PARAM } from 'src/popup/hive/pages/app-container/settings/accounts/manage-account/manage-account-selection.utils';
import {
  MANAGE_EVM_SELECTED_ADDRESS_ID_PARAM,
  MANAGE_EVM_SELECTED_SEED_ID_PARAM,
} from 'src/popup/evm/pages/home/settings/evm-accounts/evm-accounts-selection.utils';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import FormatUtils from 'src/utils/format.utils';
import Logger from 'src/utils/logger.utils';

import { I18nUtils } from 'src/utils/i18n.utils';
interface Props {
  selectedAccountType: ChainType.HIVE | ChainType.EVM;
  background?: 'white';
  removeBorder?: boolean;
}
const MAX_DISPLAYED_EVM_CHAINS = 3;

const getEvmAccountAddress = (account?: EvmAccount) => {
  return account ? EvmAccountUtils.getEvmAccountAddress(account) : undefined;
};

const areDisplayOrdersEqual = (
  left: AccountSelectorOrderRef[],
  right: AccountSelectorOrderRef[],
) =>
  left.length === right.length &&
  left.every(
    (ref, index) => JSON.stringify(ref) === JSON.stringify(right[index]),
  );

const getAccountSelectorListItemId = (item: AccountSelectorListItem) =>
  item.id.replace(/[^a-zA-Z0-9-_]/g, '-');

const isSameChain = (left: Chain, right: Chain) =>
  left.chainId.toLowerCase() === right.chainId.toLowerCase();

const resolveHiveChain = async (): Promise<HiveChain | undefined> => {
  const setupHiveChains = await ChainUtils.getAllSetupChainsForType<HiveChain>(
    ChainType.HIVE,
  );
  if (setupHiveChains[0]) {
    return setupHiveChains[0];
  }
  const setupChains = await ChainUtils.getSetupChains(true);
  return setupChains.find((chain) => chain.type === ChainType.HIVE) as
    | HiveChain
    | undefined;
};

const resolveEvmTargetChain = async (
  currentChain: Chain,
): Promise<EvmChain | undefined> => {
  if (currentChain.type === ChainType.EVM) {
    return currentChain as EvmChain;
  }
  return (
    (await EvmChainUtils.getLastEvmChain()) ??
    (await EvmChainUtils.getEthChain())
  );
};

const getActiveEvmMainnetChains = async (): Promise<EvmChain[]> => {
  const setupEvmChains = await ChainUtils.getAllSetupChainsForType<EvmChain>(
    ChainType.EVM,
  );
  return setupEvmChains.filter((chain) => !chain.testnet);
};

const stopListItemActionPropagation = (
  event: React.MouseEvent<HTMLElement>,
) => {
  event.stopPropagation();
};

const getVisibleEvmAccounts = (accounts: EvmAccount[]) =>
  accounts.filter((account) => !account.hide);

const resolveSelectableHiveAccounts = async (
  hiveAccounts: LocalAccount[],
  mk: string,
): Promise<LocalAccount[]> => {
  if (hiveAccounts.length || !mk) {
    return hiveAccounts;
  }

  return (await AccountUtils.getAccountsFromLocalStorage(mk)) ?? [];
};

const getAccountSelectorCopyValue = (item: AccountSelectorListItem) => {
  if (item.type === ChainType.HIVE) {
    return item.account.name;
  }

  return getEvmAccountAddress(item.account) ?? '';
};

type AccountSelectorTypeFilter = 'all' | ChainType.HIVE | ChainType.EVM;

const AccountSelector = ({
  selectedAccountType,
  background,
  removeBorder,
  hiveAccounts,
  activeHiveAccount,
  activeHiveAccountName,
  evmAccounts,
  activeEvmAccountAddress,
  mk,
  chain,
  loadActiveAccount,
  loadEvmActiveAccount,
  setActiveAccountType,
  setChain,
  setAccounts,
  setEvmAccounts,
  navigateToWithParams,
}: PropsFromRedux & Props) => {
  const [isOpened, setIsOpened] = useState(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const accountSelectorCardRef = useRef<HTMLDivElement | null>(null);
  const accountListRef = useRef<HTMLDivElement | null>(null);
  const accountSearchInputRef = useRef<HTMLInputElement | null>(null);
  const shouldFocusSelectedAccountRef = useRef(false);
  const selectedAccountListItemRef = useRef<HTMLDivElement | null>(null);
  const [shouldScrollToSelectedAccount, setShouldScrollToSelectedAccount] =
    useState(false);
  const [isPersistingOrder, setIsPersistingOrder] = useState(false);
  const [displayOrder, setDisplayOrder] = useState<AccountSelectorOrderRef[]>(
    [],
  );
  const [activeEvmMainnetChains, setActiveEvmMainnetChains] = useState<
    EvmChain[]
  >([]);
  const [accountSearch, setAccountSearch] = useState('');
  const [accountTypeFilter, setAccountTypeFilter] =
    useState<AccountSelectorTypeFilter>('all');
  const [accountListItems, setAccountListItems] = useState<
    AccountSelectorListItem[]
  >(() =>
    AccountSelectorOrderUtils.buildAccountSelectorListItems(
      hiveAccounts,
      evmAccounts,
    ),
  );
  const selectedHiveAccount =
    hiveAccounts.find((account) => account.name === activeHiveAccountName) ??
    hiveAccounts[0];
  const selectedEvmAccount =
    evmAccounts.find(
      (account) =>
        getEvmAccountAddress(account)?.toLowerCase() ===
        activeEvmAccountAddress?.toLowerCase(),
    ) ?? evmAccounts[0];

  const resolveSelectableAccounts = async () => {
    const selectableHiveAccounts = await resolveSelectableHiveAccounts(
      hiveAccounts,
      mk,
    );

    let selectableEvmAccounts = getVisibleEvmAccounts(evmAccounts);
    let storedEvmAccounts: EvmAccount[] = [];

    if (!selectableEvmAccounts.length && mk) {
      storedEvmAccounts =
        await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk);
      selectableEvmAccounts = getVisibleEvmAccounts(storedEvmAccounts);
    }

    if (mk && !hiveAccounts.length && selectableHiveAccounts.length > 0) {
      setAccounts(selectableHiveAccounts);
    }

    if (mk && !evmAccounts.length && storedEvmAccounts.length > 0) {
      setEvmAccounts(storedEvmAccounts);
    }

    return { selectableHiveAccounts, selectableEvmAccounts };
  };

  const getAccountListItemSearchValue = (item: AccountSelectorListItem) => {
    if (item.type === ChainType.HIVE) {
      return item.account.name;
    }

    return [
      getEvmAccountAddress(item.account),
      EvmAccountUtils.getSeedName(item.account),
      EvmAccountUtils.getAccountName(item.account),
    ]
      .filter(Boolean)
      .join(' ');
  };

  const hasHiveAccounts = accountListItems.some(
    (item) => item.type === ChainType.HIVE,
  );
  const hasEvmAccounts = accountListItems.some(
    (item) => item.type === ChainType.EVM,
  );
  const showAccountFilters = accountListItems.length >= 2;
  const showAccountTypeFilters =
    showAccountFilters && hasHiveAccounts && hasEvmAccounts;

  const filteredAccountListItems = accountListItems.filter((item) => {
    if (
      showAccountTypeFilters &&
      accountTypeFilter !== 'all' &&
      item.type !== accountTypeFilter
    ) {
      return false;
    }

    const normalizedSearch = accountSearch.trim().toLowerCase();
    if (!showAccountFilters || !normalizedSearch) {
      return true;
    }

    return getAccountListItemSearchValue(item)
      .toLowerCase()
      .includes(normalizedSearch);
  });

  const isAccountListFiltered =
    (showAccountFilters && accountSearch.trim().length > 0) ||
    (showAccountTypeFilters && accountTypeFilter !== 'all');

  useEffect(() => {
    if (
      !isOpened ||
      !shouldScrollToSelectedAccount ||
      isAccountListFiltered
    ) {
      return;
    }

    requestAnimationFrame(() => {
      selectedAccountListItemRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      if (shouldFocusSelectedAccountRef.current) {
        if (showAccountFilters) {
          accountSearchInputRef.current?.focus();
        } else {
          selectedAccountListItemRef.current?.focus();
        }
        shouldFocusSelectedAccountRef.current = false;
      }
    });
    setShouldScrollToSelectedAccount(false);
  }, [
    accountListItems,
    accountSearch,
    accountTypeFilter,
    activeEvmAccountAddress,
    activeHiveAccountName,
    isAccountListFiltered,
    isOpened,
    selectedAccountType,
    showAccountFilters,
    shouldScrollToSelectedAccount,
  ]);

  const rebuildAccountListItems = async (
    selectableHiveAccounts: LocalAccount[],
    selectableEvmAccounts: EvmAccount[],
  ) => {
    if (!mk) {
      setDisplayOrder([]);
      setAccountListItems(
        AccountSelectorOrderUtils.buildAccountSelectorListItems(
          selectableHiveAccounts,
          selectableEvmAccounts,
        ),
      );
      return;
    }

    const { displayOrder: loadedOrder, listItems } =
      await AccountSelectorOrderUtils.loadOrderedListItems(
        mk,
        selectableHiveAccounts,
        selectableEvmAccounts,
      );
    setDisplayOrder(loadedOrder);
    setAccountListItems(listItems);
  };

  useEffect(() => {
    if (isPersistingOrder) {
      return;
    }

    void (async () => {
      const { selectableHiveAccounts, selectableEvmAccounts } =
        await resolveSelectableAccounts();

      if (!mk) {
        await rebuildAccountListItems(
          selectableHiveAccounts,
          selectableEvmAccounts,
        );
        return;
      }

      if (displayOrder.length > 0) {
        const mergedOrder = AccountSelectorOrderUtils.mergeDisplayOrder(
          displayOrder,
          selectableHiveAccounts,
          selectableEvmAccounts,
        );
        if (!areDisplayOrdersEqual(mergedOrder, displayOrder)) {
          setDisplayOrder(mergedOrder);
        }
        setAccountListItems(
          AccountSelectorOrderUtils.buildOrderedListItems(
            selectableHiveAccounts,
            selectableEvmAccounts,
            mergedOrder,
          ),
        );
        return;
      }

      await rebuildAccountListItems(
        selectableHiveAccounts,
        selectableEvmAccounts,
      );
    })();
    // displayOrder is read when hive/evm accounts change after a persisted reorder
  }, [hiveAccounts, evmAccounts, mk, isPersistingOrder]);

  const closeAccountSelector = (restoreFocus = true) => {
    setIsOpened(false);
    if (restoreFocus) {
      setTimeout(() => triggerRef.current?.focus());
    }
  };

  useEffect(() => {
    if (!isOpened) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeAccountSelector();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpened]);

  const openAccountSelector = async (focusSelectedAccount = false) => {
    shouldFocusSelectedAccountRef.current = focusSelectedAccount;
    const { selectableHiveAccounts, selectableEvmAccounts } =
      await resolveSelectableAccounts();

    await rebuildAccountListItems(
      selectableHiveAccounts,
      selectableEvmAccounts,
    );
    setActiveEvmMainnetChains(await getActiveEvmMainnetChains());
    setAccountSearch('');
    setAccountTypeFilter('all');
    setShouldScrollToSelectedAccount(true);
    setIsOpened(true);
  };

  const renderHiveSelectedAccount = () => {
    if (!selectedHiveAccount) {
      return null;
    }

    return (
      <>
        <PreloadedImage
          className="user-picture"
          src={`https://images.hive.blog/u/${selectedHiveAccount.name}/avatar`}
          alt={'/assets/images/placeholders/account-placeholder.png'}
          placeholder={'/assets/images/placeholders/account-placeholder.png'}
        />
        <div
          className="selected-account-name"
          data-testid="selected-account-name">
          <div className="address-name">{selectedHiveAccount.name}</div>
        </div>
      </>
    );
  };

  const renderEvmSelectedAccount = () => {
    const address = getEvmAccountAddress(selectedEvmAccount);
    if (!selectedEvmAccount || !address) {
      return null;
    }

    return (
      <>
        <EvmAccountImage address={address} />
        <div
          className="selected-account-name"
          data-testid="selected-account-name">
          <div className="seed-name">
            {EvmAccountUtils.getSeedName(selectedEvmAccount)}
          </div>
          <div className="address-name">
            {EvmAccountUtils.getAccountName(selectedEvmAccount)}
          </div>
          <div className="address">{FormatUtils.shortenString(address, 4)}</div>
        </div>
      </>
    );
  };

  const renderSelectedAccount = () =>
    selectedAccountType === ChainType.HIVE
      ? renderHiveSelectedAccount()
      : renderEvmSelectedAccount();

  const renderDragHandle = (
    item: AccountSelectorListItem,
    dragHandleRef?: SortableDragHandleRef,
  ) => (
    <span
      className="account-selector-list-action drag-handle"
      ref={dragHandleRef}
      aria-label={`${I18nUtils.getMessage('popup_html_accounts')}: ${getAccountListItemSearchValue(item)}`}
      aria-keyshortcuts="ArrowUp ArrowDown"
      aria-disabled={isAccountListFiltered}
      role="button"
      tabIndex={isAccountListFiltered ? -1 : 0}
      onKeyDown={(event) => handleDragHandleKeyDown(event, item)}>
      <SVGIcon icon={SVGIcons.SELECT_DRAG} className="drag-icon" />
    </span>
  );

  const isAccountListItemSelected = (item: AccountSelectorListItem) => {
    if (item.type === ChainType.HIVE) {
      return (
        selectedAccountType === ChainType.HIVE &&
        item.account.name === selectedHiveAccount?.name
      );
    }

    const address = getEvmAccountAddress(item.account);
    return (
      selectedAccountType === ChainType.EVM &&
      address?.toLowerCase() === activeEvmAccountAddress?.toLowerCase()
    );
  };

  const handleAccountListItemClick = async (item: AccountSelectorListItem) => {
    if (isAccountListItemSelected(item)) {
      closeAccountSelector();
      return;
    }

    if (item.type === ChainType.HIVE) {
      const targetChain = await resolveHiveChain();
      if (!targetChain) {
        return;
      }
      const isSelectedHiveAccountLoaded =
        activeHiveAccountName === item.account.name &&
        activeHiveAccount.account?.name === item.account.name;
      if (!isSelectedHiveAccountLoaded) {
        await loadActiveAccount(item.account);
      }
      setActiveAccountType(ChainType.HIVE);
      if (!isSameChain(chain, targetChain)) {
        await setChain(targetChain);
      }
      closeAccountSelector();
      return;
    }

    const walletAddress = getEvmAccountAddress(item.account);
    if (!walletAddress) {
      return;
    }

    const targetChain = await resolveEvmTargetChain(chain);
    if (!targetChain) {
      return;
    }
    EvmActiveAccountInitUtils.markPendingUserEvmWalletSelection(
      targetChain.chainId,
    );
    if (!isSameChain(chain, targetChain)) {
      await setChain(targetChain, { syncProviderNetwork: true });
    }
    await EvmWalletUtils.promoteConnectedWalletAddress(walletAddress);
    loadEvmActiveAccount(targetChain, item.account.wallet);
    setActiveAccountType(ChainType.EVM);
    closeAccountSelector();
  };

  const handleManageHiveAccountClick = (account: LocalAccount) => {
    closeAccountSelector(false);
    navigateToWithParams(HiveScreen.SETTINGS_MANAGE_ACCOUNTS, {
      username: account.name,
      [MANAGE_ACCOUNT_SELECTED_NAME_PARAM]: account.name,
    });
  };

  const handleManageEvmAccountClick = (account: EvmAccount) => {
    closeAccountSelector(false);
    navigateToWithParams(EvmScreen.EVM_ACCOUNTS_SETTINGS, {
      seedId: account.seedId,
      addressId: account.id,
      [MANAGE_EVM_SELECTED_SEED_ID_PARAM]: account.seedId,
      [MANAGE_EVM_SELECTED_ADDRESS_ID_PARAM]: account.id,
    });
  };

  const handleAccountListItemCopy = async (
    event: React.MouseEvent<HTMLElement>,
    item: AccountSelectorListItem,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const copyValue = getAccountSelectorCopyValue(item);
    if (!copyValue) {
      return;
    }

    await copyTextWithToast(copyValue, COPY_GENERIC_MESSAGE_KEY);
  };

  const renderAccountListItemChainIndicator = (
    item: AccountSelectorListItem,
  ) => {
    if (item.type === ChainType.HIVE) {
      return (
        <div
          className="account-selector-list-item-chains"
          data-testid="account-selector-hive-chain-indicator">
          <SVGIcon
            className="account-selector-list-item-chain-icon"
            icon={SVGIcons.BLOCKCHAIN_HIVE}
          />
        </div>
      );
    }

    if (!activeEvmMainnetChains.length) {
      return null;
    }

    const displayedEvmChains = activeEvmMainnetChains.slice(
      0,
      MAX_DISPLAYED_EVM_CHAINS,
    );

    return (
      <div
        className="account-selector-list-item-chains account-selector-list-item-chains--stacked"
        data-testid="account-selector-evm-chains-indicator">
        {displayedEvmChains.map((evmChain, index) => (
          <span
            key={evmChain.chainId}
            className="account-selector-list-item-chain-logo-wrapper"
            data-testid={`account-selector-evm-chain-${evmChain.chainId}`}
            style={{ zIndex: displayedEvmChains.length - index }}>
            <ChainLogo
              chainName={evmChain.name}
              logoUri={evmChain.logo}
              className="account-selector-list-item-chain-logo"
            />
          </span>
        ))}
      </div>
    );
  };

  const getAccountListItemClassName = (item: AccountSelectorListItem) => {
    const classNames = ['account-selector-list-item'];
    if (isAccountListItemSelected(item)) {
      classNames.push('account-selector-list-item--selected');
    }
    return classNames.join(' ');
  };

  const handleAccountListItemKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    item: AccountSelectorListItem,
  ) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      void handleAccountListItemClick(item);
      return;
    }

    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const accountElements = Array.from(
      accountListRef.current?.querySelectorAll<HTMLElement>(
        '[data-account-selector-list-item]',
      ) ?? [],
    );
    const currentIndex = accountElements.indexOf(event.currentTarget);
    if (currentIndex < 0) {
      return;
    }

    const targetIndex =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? accountElements.length - 1
          : Math.min(
              Math.max(
                currentIndex + (event.key === 'ArrowDown' ? 1 : -1),
                0,
              ),
              accountElements.length - 1,
            );
    accountElements[targetIndex]?.focus();
  };

  const renderAccountListItemActions = (
    item: AccountSelectorListItem,
    dragHandleRef?: SortableDragHandleRef,
  ) => {
    const itemId = getAccountSelectorListItemId(item);

    return (
      <div
        className="account-selector-list-item-actions"
        onClick={stopListItemActionPropagation}>
        <SVGIcon
          className="account-selector-list-action manage-icon"
          dataTestId={`account-selector-manage-${itemId}`}
          icon={SVGIcons.SELECT_MANAGE_ACCOUNT}
          ariaLabel={`${I18nUtils.getMessage('manage_accounts')}: ${getAccountListItemSearchValue(item)}`}
          onClick={(event) => {
            stopListItemActionPropagation(event);
            if (item.type === ChainType.HIVE) {
              handleManageHiveAccountClick(item.account);
            } else {
              handleManageEvmAccountClick(item.account);
            }
          }}
        />
        <SVGIcon
          className="account-selector-list-action copy-icon"
          dataTestId={`account-selector-copy-${itemId}`}
          icon={SVGIcons.SELECT_COPY}
          ariaLabel={`${I18nUtils.getMessage('html_popup_copy')}: ${getAccountListItemSearchValue(item)}`}
          onClick={(event) => void handleAccountListItemCopy(event, item)}
        />
        <span onClick={stopListItemActionPropagation}>
          {renderDragHandle(item, dragHandleRef)}
        </span>
      </div>
    );
  };

  const renderAccountListItemTrailing = (
    item: AccountSelectorListItem,
    dragHandleRef?: SortableDragHandleRef,
  ) => (
    <div className="account-selector-list-item-trailing">
      {renderAccountListItemChainIndicator(item)}
      {renderAccountListItemActions(item, dragHandleRef)}
    </div>
  );

  const renderHiveAccount = (
    item: Extract<AccountSelectorListItem, { type: ChainType.HIVE }>,
    dragHandleRef?: SortableDragHandleRef,
  ) => {
    const account = item.account;

    return (
      <div
        className={getAccountListItemClassName(item)}
        data-testid={`account-selector-hive-account-${account.name}`}
        data-account-selector-list-item
        key={`hive-${account.name}`}
        ref={
          isAccountListItemSelected(item) ? selectedAccountListItemRef : null
        }
        role="button"
        tabIndex={0}
        aria-current={isAccountListItemSelected(item) ? 'true' : undefined}
        onKeyDown={(event) => handleAccountListItemKeyDown(event, item)}
        onClick={() => void handleAccountListItemClick(item)}>
        <PreloadedImage
          className="user-picture"
          src={`https://images.hive.blog/u/${account.name}/avatar`}
          alt={'/assets/images/placeholders/account-placeholder.png'}
          placeholder={'/assets/images/placeholders/account-placeholder.png'}
        />
        <div className="account-selector-list-item-label">{account.name}</div>
        {renderAccountListItemTrailing(item, dragHandleRef)}
      </div>
    );
  };

  const renderEvmAccount = (
    item: Extract<AccountSelectorListItem, { type: ChainType.EVM }>,
    dragHandleRef?: SortableDragHandleRef,
  ) => {
    const account = item.account;
    const address = getEvmAccountAddress(account);
    if (!address) {
      return null;
    }

    return (
      <div
        className={getAccountListItemClassName(item)}
        data-testid={`account-selector-evm-account-${address}`}
        data-account-selector-list-item
        key={`evm-${address}`}
        ref={
          isAccountListItemSelected(item) ? selectedAccountListItemRef : null
        }
        role="button"
        tabIndex={0}
        aria-current={isAccountListItemSelected(item) ? 'true' : undefined}
        onKeyDown={(event) => handleAccountListItemKeyDown(event, item)}
        onClick={() => void handleAccountListItemClick(item)}>
        <EvmAccountImage address={address} />
        <div className="selected-account-name">
          <div className="seed-name">
            {EvmAccountUtils.getSeedName(account)}
          </div>
          <div className="address-name">
            {EvmAccountUtils.getAccountName(account) ?? 'No name'}
          </div>
          <div className="address">{FormatUtils.shortenString(address, 4)}</div>
        </div>
        {renderAccountListItemTrailing(item, dragHandleRef)}
      </div>
    );
  };

  const renderAccountListItem = (
    item: AccountSelectorListItem,
    dragHandleRef?: SortableDragHandleRef,
  ) =>
    item.type === ChainType.HIVE
      ? renderHiveAccount(item, dragHandleRef)
      : renderEvmAccount(item, dragHandleRef);

  const reorderAccountListItems = async (
    sourceIndex: number,
    destinationIndex: number,
  ) => {
    if (
      destinationIndex === sourceIndex ||
      !mk ||
      isAccountListFiltered
    ) {
      return;
    }

    const list = Array.from(accountListItems);
    const [removed] = list.splice(sourceIndex, 1);
    list.splice(destinationIndex, 0, removed);
    const orderedRefs = AccountSelectorOrderUtils.toOrderRefs(list);

    if (areDisplayOrdersEqual(displayOrder, orderedRefs)) {
      return;
    }

    const evmOrderChanged = !AccountSelectorOrderUtils.areEvmOrderRefsEqual(
      displayOrder,
      orderedRefs,
    );

    setAccountListItems(list);
    setIsPersistingOrder(true);

    try {
      const { selectableHiveAccounts, selectableEvmAccounts } =
        await resolveSelectableAccounts();

      const {
        displayOrder: persistedOrder,
        hiveAccounts: persistedHiveAccounts,
        evmAccounts: persistedEvmAccounts,
      } = await AccountSelectorOrderUtils.applyDisplayOrder(
        mk,
        orderedRefs,
        selectableHiveAccounts,
        selectableEvmAccounts,
      );

      setDisplayOrder(persistedOrder);
      setAccounts(persistedHiveAccounts);
      setEvmAccounts(persistedEvmAccounts);
      setAccountListItems(
        AccountSelectorOrderUtils.buildOrderedListItems(
          persistedHiveAccounts,
          persistedEvmAccounts,
          persistedOrder,
        ),
      );

      if (evmOrderChanged) {
        const activeEvmAddress =
          activeEvmAccountAddress ?? getEvmAccountAddress(selectedEvmAccount);
        if (activeEvmAddress) {
          await EvmWalletUtils.promoteConnectedWalletAddress(activeEvmAddress);
        }
      }
    } catch (error) {
      setAccountListItems(accountListItems);
      Logger.error('Unable to reorder accounts', error);
    } finally {
      setIsPersistingOrder(false);
    }
  };

  const handleDragHandleKeyDown = (
    event: React.KeyboardEvent<HTMLSpanElement>,
    item: AccountSelectorListItem,
  ) => {
    if (!['ArrowDown', 'ArrowUp'].includes(event.key)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const sourceIndex = accountListItems.findIndex(
      (accountListItem) => accountListItem.id === item.id,
    );
    if (sourceIndex < 0) {
      return;
    }

    const destinationIndex = Math.min(
      Math.max(sourceIndex + (event.key === 'ArrowDown' ? 1 : -1), 0),
      accountListItems.length - 1,
    );
    void reorderAccountListItems(sourceIndex, destinationIndex);
  };

  const handleAccountTypeFilterClick = (
    accountType: ChainType.HIVE | ChainType.EVM,
  ) => {
    setAccountTypeFilter((currentFilter) =>
      currentFilter === accountType ? 'all' : accountType,
    );
  };

  const renderCreateIcon = (icon: SVGIcons, testId: string) => (
    <span className="account-selector-create-mini-card" data-testid={testId}>
      <SVGIcon
        icon={icon}
        className={`account-selector-create-mini-card-icon ${
          icon === SVGIcons.BLOCKCHAIN_HIVE ? 'hive' : ''
        }`}
      />
    </span>
  );

  const handleAddAccountClick = async () => {
    closeAccountSelector(false);

    const targetChain =
      selectedAccountType === ChainType.EVM
        ? await resolveEvmTargetChain(chain)
        : await resolveHiveChain();
    if (targetChain && !isSameChain(chain, targetChain)) {
      await setChain(targetChain);
    }
    navigateToWithParams(Screen.SETTINGS_ADD_ACCOUNT, { selectedAccountType });
  };

  const handleExportAccountsClick = async () => {
    if (!mk) {
      return;
    }

    const selectableHiveAccounts = await resolveSelectableHiveAccounts(
      hiveAccounts,
      mk,
    );
    const storedEvmAccounts =
      await EvmWalletUtils.getAccountsFromLocalStorage(mk);

    await AccountUtils.downloadMultichainAccounts(
      selectableHiveAccounts,
      storedEvmAccounts,
      mk,
    );
    closeAccountSelector();
  };

  const handleAccountSelectorKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.key !== 'Tab' || !accountSelectorCardRef.current) {
      return;
    }

    const focusableElements = Array.from(
      accountSelectorCardRef.current.querySelectorAll<HTMLElement>(
        'button, input, [href], [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => !element.hasAttribute('disabled'));
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement?.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement?.focus();
    }
  };

  if (
    (selectedAccountType === ChainType.HIVE && !selectedHiveAccount) ||
    (selectedAccountType === ChainType.EVM && !selectedEvmAccount)
  ) {
    return null;
  }

  return (
    <div className={`account-selector ${isOpened ? 'opened' : 'closed'}`}>
      <div
        ref={triggerRef}
        className={`selected-account-panel ${background ? background : ''} ${
          removeBorder ? 'remove-border' : ''
        }`}
        data-testid="account-selector-trigger"
        role="button"
        tabIndex={0}
        aria-label={`${I18nUtils.getMessage('popup_html_accounts')}: ${
          selectedAccountType === ChainType.HIVE
            ? selectedHiveAccount?.name
            : EvmAccountUtils.getAccountName(selectedEvmAccount) ??
              getEvmAccountAddress(selectedEvmAccount)
        }`}
        aria-haspopup="dialog"
        aria-expanded={isOpened}
        aria-controls={isOpened ? 'account-selector-dialog' : undefined}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            void openAccountSelector(true);
          }
        }}
        onClick={() => void openAccountSelector()}>
        {renderSelectedAccount()}
        <SVGIcon
          className="account-selector-dropdown-handle"
          dataTestId="account-selector-dropdown-handle"
          icon={
            isOpened ? SVGIcons.SELECT_ARROW_UP : SVGIcons.SELECT_ARROW_DOWN
          }
        />
      </div>
      {isOpened && (
        <div
          className="account-selector-overlay"
          onKeyDown={handleAccountSelectorKeyDown}>
          <div
            className="account-selector-backdrop"
            data-testid="account-selector-backdrop"
            onClick={() => closeAccountSelector()}></div>
          <div
            id="account-selector-dialog"
            ref={accountSelectorCardRef}
            className="account-selector-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-selector-title">
            <div
              id="account-selector-title"
              className="account-selector-title"
              data-testid="account-selector-title">
              {I18nUtils.getMessage('popup_html_accounts')}
            </div>
            {showAccountFilters && (
              <div className="account-selector-filters">
                <InputComponent
                  ref={accountSearchInputRef}
                  classname="account-selector-search"
                  dataTestId="account-selector-search-input"
                  type={InputType.TEXT}
                  logo={SVGIcons.INPUT_SEARCH}
                  logoPosition="left"
                  placeholder="popup_html_search"
                  value={accountSearch}
                  onChange={setAccountSearch}
                />
                {showAccountTypeFilters && (
                  <div className="account-selector-type-filter">
                    <button
                      className={`account-selector-type-filter-button ${
                        accountTypeFilter === ChainType.HIVE ? 'selected' : ''
                      }`}
                      data-testid="account-selector-filter-hive"
                      aria-pressed={accountTypeFilter === ChainType.HIVE}
                      onClick={() =>
                        handleAccountTypeFilterClick(ChainType.HIVE)
                      }
                      type="button">
                      <SVGIcon
                        icon={SVGIcons.BLOCKCHAIN_HIVE}
                        className="account-selector-type-filter-icon"
                      />
                      <span>HIVE</span>
                    </button>
                    <button
                      className={`account-selector-type-filter-button ${
                        accountTypeFilter === ChainType.EVM ? 'selected' : ''
                      }`}
                      data-testid="account-selector-filter-evm"
                      aria-pressed={accountTypeFilter === ChainType.EVM}
                      onClick={() =>
                        handleAccountTypeFilterClick(ChainType.EVM)
                      }
                      type="button">
                      <SVGIcon
                        icon={SVGIcons.BLOCKCHAIN_ETHEREUM}
                        className="account-selector-type-filter-icon"
                      />
                      <span>EVM</span>
                    </button>
                  </div>
                )}
              </div>
            )}
            <div
              className="account-selector-list"
              data-testid="account-selector-list"
              role="list"
              ref={accountListRef}>
              <SortableListComponent
                className="account-selector-list-items"
                items={filteredAccountListItems}
                getItemId={(item) => item.id}
                disabled={isAccountListFiltered || isPersistingOrder}
                onReorder={(sourceIndex, destinationIndex) =>
                  void reorderAccountListItems(sourceIndex, destinationIndex)
                }>
                {(item, _index, { dragHandleRef }) =>
                  renderAccountListItem(item, dragHandleRef)
                }
              </SortableListComponent>
            </div>
            <Separator type="horizontal" fullSize />
            <div className="account-selector-create-actions">
              <button
                className="account-selector-create-button"
                data-testid="account-selector-create-button"
                onClick={() => void handleAddAccountClick()}
                type="button">
                <SVGIcon
                  icon={SVGIcons.MENU_ACCOUNTS_ADD_ACCOUNT}
                  className="account-selector-create-button-icon"
                  svgViewBox="17 11 12 18"
                />
                <span>{I18nUtils.getMessage('popup_html_add_account')}</span>
                <div className="account-selector-create-mini-cards">
                  {renderCreateIcon(
                    SVGIcons.BLOCKCHAIN_HIVE,
                    'account-selector-create-hive',
                  )}
                  {renderCreateIcon(
                    SVGIcons.BLOCKCHAIN_ETHEREUM,
                    'account-selector-create-evm',
                  )}
                </div>
              </button>
              <button
                className="account-selector-export-button"
                data-testid="account-selector-export-button"
                onClick={() => void handleExportAccountsClick()}
                type="button">
                <SVGIcon
                  icon={SVGIcons.MENU_ACCOUNTS_EXPORT}
                  className="account-selector-export-button-icon"
                  svgViewBox="14 13 16 15"
                />
                <span>{I18nUtils.getMessage('popup_html_export')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  const activeEvmAccountAddress =
    state.evm.activeAccount.wallet?.address ?? state.evm.activeAccount.address;

  return {
    mk: state.mk,
    hiveAccounts: state.hive.accounts,
    activeHiveAccount: state.hive.activeAccount as ActiveAccount,
    activeHiveAccountName: state.hive.activeAccount.name,
    evmAccounts: state.evm.accounts.filter((account) => !account.hide),
    activeEvmAccountAddress,
    chain: state.chain as Chain,
  };
};

const connector = connect(mapStateToProps, {
  loadActiveAccount,
  loadEvmActiveAccount,
  setActiveAccountType,
  setChain,
  setAccounts,
  setEvmAccounts,
  navigateToWithParams,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AccountSelectorComponent = connector(AccountSelector);
