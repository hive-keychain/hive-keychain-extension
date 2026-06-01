import { Separator } from '@common-ui/separator/separator.component';
import { AccountSelectorOrderRef } from '@interfaces/account-selector-order.interface';
import { Screen } from '@interfaces/screen.interface';
import { setEvmAccounts } from '@popup/evm/actions/accounts.actions';
import { loadEvmActiveAccount } from '@popup/evm/actions/active-account.actions';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmAccountUtils } from '@popup/evm/utils/evm-account.utils';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { setAccounts } from '@popup/hive/actions/account.actions';
import { loadActiveAccount } from '@popup/hive/actions/active-account.actions';
import { HiveScreen } from '@popup/hive/reference-data/hive-screen.enum';
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
import React, { useEffect, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  DraggableProvidedDragHandleProps,
  DropResult,
  Droppable,
} from 'react-beautiful-dnd';
import { ConnectedProps, connect } from 'react-redux';
import { ChainLogo } from 'src/common-ui/chain-logo/chain-logo.component';
import { EvmAccountImage } from 'src/common-ui/evm/evm-account-image/evm-account-image.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import {
  COPY_GENERIC_MESSAGE_KEY,
  copyTextWithToast,
} from 'src/common-ui/toast/copy-toast.utils';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import { MANAGE_ACCOUNT_SELECTED_NAME_PARAM } from 'src/popup/hive/pages/app-container/settings/accounts/manage-account/manage-account-selection.utils';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import FormatUtils from 'src/utils/format.utils';

interface Props {
  selectedAccountType: ChainType.HIVE | ChainType.EVM;
  background?: 'white';
  removeBorder?: boolean;
}
const MAX_DISPLAYED_EVM_CHAINS = 5;

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

const AccountSelector = ({
  selectedAccountType,
  background,
  removeBorder,
  hiveAccounts,
  activeHiveAccountName,
  evmAccounts,
  activeEvmAccountAddress,
  mk,
  chain,
  loadActiveAccount,
  loadEvmActiveAccount,
  setChain,
  setAccounts,
  setEvmAccounts,
  navigateToWithParams,
}: PropsFromRedux & Props) => {
  const [isOpened, setIsOpened] = useState(false);
  const [isPersistingOrder, setIsPersistingOrder] = useState(false);
  const [displayOrder, setDisplayOrder] = useState<AccountSelectorOrderRef[]>(
    [],
  );
  const [activeEvmMainnetChains, setActiveEvmMainnetChains] = useState<
    EvmChain[]
  >([]);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hiveAccounts, evmAccounts, mk, isPersistingOrder]);

  const openAccountSelector = async () => {
    const { selectableHiveAccounts, selectableEvmAccounts } =
      await resolveSelectableAccounts();

    await rebuildAccountListItems(
      selectableHiveAccounts,
      selectableEvmAccounts,
    );
    setActiveEvmMainnetChains(await getActiveEvmMainnetChains());
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
    dragHandle?: DraggableProvidedDragHandleProps | null,
  ) => (
    <span className="account-selector-list-action drag-handle" {...dragHandle}>
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
      setIsOpened(false);
      return;
    }

    if (item.type === ChainType.HIVE) {
      const targetChain = await resolveHiveChain();
      if (!targetChain) {
        return;
      }
      if (!isSameChain(chain, targetChain)) {
        await setChain(targetChain);
      }
      loadActiveAccount(item.account);
      setIsOpened(false);
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
    if (!isSameChain(chain, targetChain)) {
      await setChain(targetChain);
    }
    loadEvmActiveAccount(targetChain, item.account.wallet);
    setIsOpened(false);
  };

  const handleManageHiveAccountClick = (account: LocalAccount) => {
    setIsOpened(false);
    navigateToWithParams(HiveScreen.SETTINGS_MANAGE_ACCOUNTS, {
      username: account.name,
      [MANAGE_ACCOUNT_SELECTED_NAME_PARAM]: account.name,
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

  const renderAccountListItemActions = (
    item: AccountSelectorListItem,
    dragHandle?: DraggableProvidedDragHandleProps | null,
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
          onClick={(event) => {
            stopListItemActionPropagation(event);
            if (item.type === ChainType.HIVE) {
              handleManageHiveAccountClick(item.account);
            }
          }}
        />
        <SVGIcon
          className="account-selector-list-action copy-icon"
          dataTestId={`account-selector-copy-${itemId}`}
          icon={SVGIcons.SELECT_COPY}
          onClick={(event) => void handleAccountListItemCopy(event, item)}
        />
        <span onClick={stopListItemActionPropagation}>
          {renderDragHandle(dragHandle)}
        </span>
      </div>
    );
  };

  const renderAccountListItemTrailing = (
    item: AccountSelectorListItem,
    dragHandle?: DraggableProvidedDragHandleProps | null,
  ) => (
    <div className="account-selector-list-item-trailing">
      {renderAccountListItemChainIndicator(item)}
      {renderAccountListItemActions(item, dragHandle)}
    </div>
  );

  const renderHiveAccount = (
    item: Extract<AccountSelectorListItem, { type: ChainType.HIVE }>,
    dragHandle?: DraggableProvidedDragHandleProps | null,
  ) => {
    const account = item.account;

    return (
      <div
        className={getAccountListItemClassName(item)}
        data-testid={`account-selector-hive-account-${account.name}`}
        key={`hive-${account.name}`}
        onClick={() => void handleAccountListItemClick(item)}>
        <PreloadedImage
          className="user-picture"
          src={`https://images.hive.blog/u/${account.name}/avatar`}
          alt={'/assets/images/placeholders/account-placeholder.png'}
          placeholder={'/assets/images/placeholders/account-placeholder.png'}
        />
        <div className="account-selector-list-item-label">{account.name}</div>
        {renderAccountListItemTrailing(item, dragHandle)}
      </div>
    );
  };

  const renderEvmAccount = (
    item: Extract<AccountSelectorListItem, { type: ChainType.EVM }>,
    dragHandle?: DraggableProvidedDragHandleProps | null,
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
        key={`evm-${address}`}
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
        {renderAccountListItemTrailing(item, dragHandle)}
      </div>
    );
  };

  const renderAccountListItem = (
    item: AccountSelectorListItem,
    dragHandle?: DraggableProvidedDragHandleProps | null,
  ) =>
    item.type === ChainType.HIVE
      ? renderHiveAccount(item, dragHandle)
      : renderEvmAccount(item, dragHandle);

  const onDragEnd = async (result: DropResult) => {
    if (
      !result.destination ||
      result.destination.index === result.source.index ||
      !mk
    ) {
      return;
    }

    const list = Array.from(accountListItems);
    const [removed] = list.splice(result.source.index, 1);
    list.splice(result.destination.index, 0, removed);
    const orderedRefs = AccountSelectorOrderUtils.toOrderRefs(list);

    if (areDisplayOrdersEqual(displayOrder, orderedRefs)) {
      return;
    }

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
    } finally {
      setIsPersistingOrder(false);
    }
  };

  const renderCreateIcon = (icon: SVGIcons, testId: string) => (
    <span
      className="account-selector-create-mini-card"
      data-testid={testId}>
      <SVGIcon
        icon={icon}
        className={`account-selector-create-mini-card-icon ${
          icon === SVGIcons.BLOCKCHAIN_HIVE ? 'hive' : ''
        }`}
      />
    </span>
  );

  const handleAddAccountClick = async () => {
    setIsOpened(false);

    const targetChain = await resolveHiveChain();
    if (targetChain && !isSameChain(chain, targetChain)) {
      await setChain(targetChain);
    }
    navigateToWithParams(Screen.SETTINGS_ADD_ACCOUNT, {});
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
        className={`selected-account-panel ${background ? background : ''} ${
          removeBorder ? 'remove-border' : ''
        }`}
        data-testid="account-selector-trigger"
        onClick={openAccountSelector}>
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
        <div className="account-selector-overlay">
          <div
            className="account-selector-backdrop"
            data-testid="account-selector-backdrop"
            onClick={() => setIsOpened(false)}></div>
          <div className="account-selector-card">
            <div
              className="account-selector-title"
              data-testid="account-selector-title">
              {chrome.i18n.getMessage('popup_html_accounts')}
            </div>
            <div
              className="account-selector-list"
              data-testid="account-selector-list">
              <DragDropContext
                onDragEnd={(dragResult) => void onDragEnd(dragResult)}>
                <Droppable
                  droppableId="account-selector-list"
                  type="account-selector-list-item">
                  {(provided) => (
                    <div
                      className="account-selector-list-items"
                      {...provided.droppableProps}
                      ref={provided.innerRef}>
                      {accountListItems.map((item, index) => (
                        <Draggable
                          key={item.id}
                          draggableId={item.id}
                          index={index}>
                          {(draggableProvided) => (
                            <div
                              ref={draggableProvided.innerRef}
                              {...draggableProvided.draggableProps}>
                              {renderAccountListItem(
                                item,
                                draggableProvided.dragHandleProps,
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
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
                <span>{chrome.i18n.getMessage('popup_html_add_account')}</span>
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
    activeHiveAccountName: state.hive.activeAccount.name,
    evmAccounts: state.evm.accounts.filter((account) => !account.hide),
    activeEvmAccountAddress,
    chain: state.chain as Chain,
  };
};

const connector = connect(mapStateToProps, {
  loadActiveAccount,
  loadEvmActiveAccount,
  setChain,
  setAccounts,
  setEvmAccounts,
  navigateToWithParams,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AccountSelectorComponent = connector(AccountSelector);
