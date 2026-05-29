import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmAccountUtils } from '@popup/evm/utils/evm-account.utils';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  DraggableProvidedDragHandleProps,
  DropResult,
  Droppable,
} from 'react-beautiful-dnd';
import { ConnectedProps, connect } from 'react-redux';
import { EvmAccountImage } from 'src/common-ui/evm/evm-account-image/evm-account-image.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import FormatUtils from 'src/utils/format.utils';

interface Props {
  selectedAccountType: 'hive' | 'evm';
  background?: 'white';
  removeBorder?: boolean;
}

type AccountSelectorListItem =
  | {
      account: LocalAccount;
      id: string;
      type: 'hive';
    }
  | {
      account: EvmAccount;
      id: string;
      type: 'evm';
    };

const getEvmAccountAddress = (account?: EvmAccount) => {
  return account ? EvmAccountUtils.getEvmAccountAddress(account) : undefined;
};

const buildAccountSelectorListItems = (
  hiveAccounts: LocalAccount[],
  evmAccounts: EvmAccount[],
): AccountSelectorListItem[] => [
  ...hiveAccounts.map((account) => ({
    account,
    id: `hive-${account.name}`,
    type: 'hive' as const,
  })),
  ...evmAccounts.map((account) => ({
    account,
    id: `evm-${getEvmAccountAddress(account)}`,
    type: 'evm' as const,
  })),
];

const getAccountSelectorListItemId = (item: AccountSelectorListItem) =>
  item.id.replace(/[^a-zA-Z0-9-_]/g, '-');

const AccountSelector = ({
  selectedAccountType,
  background,
  removeBorder,
  hiveAccounts,
  activeHiveAccountName,
  evmAccounts,
  activeEvmAccountAddress,
  mk,
}: PropsFromRedux & Props) => {
  const [isOpened, setIsOpened] = useState(false);
  const [accountListItems, setAccountListItems] = useState<
    AccountSelectorListItem[]
  >(() => buildAccountSelectorListItems(hiveAccounts, evmAccounts));
  const selectedHiveAccount =
    hiveAccounts.find((account) => account.name === activeHiveAccountName) ??
    hiveAccounts[0];
  const selectedEvmAccount =
    evmAccounts.find(
      (account) =>
        getEvmAccountAddress(account)?.toLowerCase() ===
        activeEvmAccountAddress?.toLowerCase(),
    ) ?? evmAccounts[0];

  useEffect(() => {
    setAccountListItems(
      buildAccountSelectorListItems(hiveAccounts, evmAccounts),
    );
  }, [hiveAccounts, evmAccounts]);

  const openAccountSelector = async () => {
    let selectableHiveAccounts = hiveAccounts;

    if (!hiveAccounts.length && mk) {
      const storedHiveAccounts =
        await AccountUtils.getAccountsFromLocalStorage(mk);

      if (storedHiveAccounts?.length) {
        selectableHiveAccounts = storedHiveAccounts;
      }
    }

    setAccountListItems(
      buildAccountSelectorListItems(selectableHiveAccounts, evmAccounts),
    );
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
    selectedAccountType === 'hive'
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
    if (item.type === 'hive') {
      return (
        selectedAccountType === 'hive' &&
        item.account.name === selectedHiveAccount?.name
      );
    }

    const address = getEvmAccountAddress(item.account);
    return (
      selectedAccountType === 'evm' &&
      address?.toLowerCase() === activeEvmAccountAddress?.toLowerCase()
    );
  };

  const renderAccountListItemActions = (
    item: AccountSelectorListItem,
    dragHandle?: DraggableProvidedDragHandleProps | null,
  ) => {
    const itemId = getAccountSelectorListItemId(item);
    const selected = isAccountListItemSelected(item);

    return (
      <div className="account-selector-list-item-actions">
        {selected && (
          <SVGIcon
            className="account-selector-list-action active-icon"
            dataTestId={`account-selector-selected-${itemId}`}
            icon={SVGIcons.SELECT_ACTIVE}
          />
        )}
        <SVGIcon
          className="account-selector-list-action edit-icon"
          dataTestId={`account-selector-edit-${itemId}`}
          icon={SVGIcons.GLOBAL_EDIT}
          onClick={() => {}}
        />
        <SVGIcon
          className="account-selector-list-action copy-icon"
          dataTestId={`account-selector-copy-${itemId}`}
          icon={SVGIcons.SELECT_COPY}
        />
        {renderDragHandle(dragHandle)}
      </div>
    );
  };

  const renderHiveAccount = (
    item: Extract<AccountSelectorListItem, { type: 'hive' }>,
    dragHandle?: DraggableProvidedDragHandleProps | null,
  ) => {
    const account = item.account;

    return (
      <div
        className="account-selector-list-item"
        data-testid={`account-selector-hive-account-${account.name}`}
        key={`hive-${account.name}`}>
        <PreloadedImage
          className="user-picture"
          src={`https://images.hive.blog/u/${account.name}/avatar`}
          alt={'/assets/images/placeholders/account-placeholder.png'}
          placeholder={'/assets/images/placeholders/account-placeholder.png'}
        />
        <div className="account-selector-list-item-label">{account.name}</div>
        {renderAccountListItemActions(item, dragHandle)}
      </div>
    );
  };

  const renderEvmAccount = (
    item: Extract<AccountSelectorListItem, { type: 'evm' }>,
    dragHandle?: DraggableProvidedDragHandleProps | null,
  ) => {
    const account = item.account;
    const address = getEvmAccountAddress(account);
    if (!address) {
      return null;
    }

    return (
      <div
        className="account-selector-list-item"
        data-testid={`account-selector-evm-account-${address}`}
        key={`evm-${address}`}>
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
        {renderAccountListItemActions(item, dragHandle)}
      </div>
    );
  };

  const renderAccountListItem = (
    item: AccountSelectorListItem,
    dragHandle?: DraggableProvidedDragHandleProps | null,
  ) =>
    item.type === 'hive'
      ? renderHiveAccount(item, dragHandle)
      : renderEvmAccount(item, dragHandle);

  const onDragEnd = (result: DropResult) => {
    if (
      !result.destination ||
      result.destination.index === result.source.index
    ) {
      return;
    }

    const list = Array.from(accountListItems);
    const [removed] = list.splice(result.source.index, 1);
    list.splice(result.destination.index, 0, removed);
    setAccountListItems(list);
  };

  const renderCreateButton = (icon: SVGIcons, testId: string) => (
    <button
      className="account-selector-create-button"
      data-testid={testId}
      type="button">
      <SVGIcon icon={icon} className="account-selector-create-button-icon" />
      <span>{chrome.i18n.getMessage('evm_addresses_add')}</span>
    </button>
  );

  if (
    (selectedAccountType === 'hive' && !selectedHiveAccount) ||
    (selectedAccountType === 'evm' && !selectedEvmAccount)
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
              <DragDropContext onDragEnd={onDragEnd}>
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
            <div className="account-selector-create-actions">
              {renderCreateButton(
                SVGIcons.BLOCKCHAIN_ETHEREUM,
                'account-selector-create-evm',
              )}
              {renderCreateButton(
                SVGIcons.BLOCKCHAIN_HIVE,
                'account-selector-create-hive',
              )}
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
  };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AccountSelectorComponent = connector(AccountSelector);
