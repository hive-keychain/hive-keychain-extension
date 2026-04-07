import {
  EvmLocalAccountListItem,
  EvmSelectAccountItem,
} from '@interfaces/list-item.interface';
import { setEvmAccounts } from '@popup/evm/actions/accounts.actions';
import { loadEvmActiveAccount } from '@popup/evm/actions/active-account.actions';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmSelectAccountSectionItemComponent } from '@popup/evm/pages/home/evm-select-account-section/evm-select-account-section-item.component';
import { EvmAccountUtils } from '@popup/evm/utils/evm-account.utils';
import {
  EvmAddressDetail,
  EvmAddressesUtils,
} from '@popup/evm/utils/evm-addresses.utils';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { EvmLightNodeUtils } from '@popup/evm/utils/evm-light-node.utils';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useRef, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from 'react-beautiful-dnd';
import Select, { SelectRenderer } from 'react-dropdown-select';
import { ConnectedProps, connect } from 'react-redux';
import { EvmAccountImage } from 'src/common-ui/evm/evm-account-image/evm-account-image.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import FormatUtils from 'src/utils/format.utils';

interface Props {
  background?: 'white';
  fullSize?: boolean;
  isOnMain?: boolean;
  removeBorder?: boolean;
}

const SelectAccountSection = ({
  background,
  fullSize,
  accounts,
  activeAccount,
  chain,
  mk,
  loadEvmActiveAccount,
  setEvmAccounts,
  isOnMain = false,
  removeBorder,
}: PropsFromRedux & Props) => {
  const defaultOptions: EvmLocalAccountListItem[] = [];

  const [isOpened, setIsOpened] = useState(false);
  const [options, setOptions] = useState(defaultOptions);
  const [selectedAddress, setSelectedAddress] =
    useState<EvmSelectAccountItem>();
  const initRequestId = useRef(0);

  useEffect(() => {
    init();
  }, [accounts, activeAccount]);

  const buildPlaceholderAddressDetail = (
    account: EvmAccount,
  ): EvmAddressDetail => ({
    fullAddress: account.wallet.address,
    formattedAddress: EvmFormatUtils.formatAddress(account.wallet.address),
    label: account.nickname ?? EvmAccountUtils.getAccountFullname(account),
    avatar: undefined,
  });

  const init = async () => {
    const currentRequestId = ++initRequestId.current;

    if (accounts && activeAccount.address) {
      const visibleAccounts = accounts.filter((account) => !account.hide);

      // Build options immediately with placeholder details so the selector
      // renders without waiting for async ENS / label lookups.
      const placeholderOpts = visibleAccounts.map((account: EvmAccount) => ({
        label: account.wallet.address,
        value: {
          account: account,
          addressDetails: buildPlaceholderAddressDetail(account),
        },
      }));

      if (initRequestId.current !== currentRequestId) {
        return;
      }

      setOptions(placeholderOpts);
      const placeholderSelected = placeholderOpts.find(
        (opt) =>
          opt.value.account.wallet.address === activeAccount.wallet.address,
      );
      if (placeholderSelected) {
        setSelectedAddress(placeholderSelected.value);
      }

      // Enrich with full address details (ENS, avatar, custom labels) in the
      // background and update state once ready.
      const enrichedOpts = await Promise.all(
        visibleAccounts.map(async (account: EvmAccount) => ({
          label: account.wallet.address,
          value: {
            account: account,
            addressDetails: await EvmAddressesUtils.getAddressDetails(
              account.wallet.address,
              chain!.chainId,
            ),
          },
        })),
      );

      if (initRequestId.current !== currentRequestId) {
        return;
      }

      setOptions(enrichedOpts);
      const enrichedSelected = enrichedOpts.find(
        (opt) =>
          opt.value.account.wallet.address === activeAccount.wallet.address,
      );
      if (enrichedSelected) {
        setSelectedAddress(enrichedSelected.value);
      }
    }
  };

  const handleItemClicked = async (address: string) => {
    const itemClicked = accounts.find(
      (account: EvmAccount) => account.wallet.address === address,
    );
    if (itemClicked) {
      await EvmLightNodeUtils.registerAddress(chain.chainId, address, false);
      loadEvmActiveAccount(chain, itemClicked?.wallet);
      handleClickOnSelector();
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (
      !result.destination ||
      result.destination.index === result.source.index
    )
      return;

    const list = Array.from(options);
    const [removed] = list.splice(result.source.index, 1);
    list.splice(result.destination.index, 0, removed);
    setOptions(list);

    const reorderedAccounts = await EvmWalletUtils.reorderAccounts(
      list.map((option) => option.value.account),
      mk,
    );
    setEvmAccounts(reorderedAccounts);
  };

  const handleClickOnSelector = () => {
    setIsOpened(!isOpened);
  };

  const customLabelRender = (
    selectProps: SelectRenderer<EvmLocalAccountListItem>,
  ) => {
    return (
      <div
        className={`selected-account-panel ${fullSize ? 'fullsize' : ''}`}
        onClick={() => {
          handleClickOnSelector();
        }}>
        <EvmAccountImage
          address={selectedAddress?.account.wallet.address}
          avatar={selectedAddress?.addressDetails.avatar}
        />
        <div
          className="selected-account-name"
          data-testid="selected-account-name">
          <div className="seed-name">
            {EvmAccountUtils.getSeedName(selectedAddress?.account!)}
          </div>
          <div className="address-name">
            {selectedAddress?.account.nickname ??
              selectedAddress?.addressDetails.label ??
              'No name'}
          </div>
          <div className="address">
            {FormatUtils.shortenString(
              selectedAddress?.account.wallet.address!,
              4,
            )}
          </div>
        </div>
      </div>
    );
  };

  const customHandleRenderer = ({
    props,
    state,
    methods,
  }: SelectRenderer<EvmLocalAccountListItem>) => {
    return (
      <SVGIcon
        className="custom-select-handle"
        icon={isOpened ? SVGIcons.SELECT_ARROW_UP : SVGIcons.SELECT_ARROW_DOWN}
        onClick={() => {
          handleClickOnSelector();
        }}
      />
    );
  };

  const customDropdownRenderer = ({
    props,
    state,
    methods,
  }: SelectRenderer<EvmLocalAccountListItem>) => {
    return (
      <div className="custom-select-dropdown">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable
            droppableId="droppable-account"
            type="account"
            isDropDisabled={!isOnMain}>
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {options.map((option, index) => (
                  <Draggable
                    key={option.value.account.wallet.address}
                    draggableId={option.value.account.wallet.address}
                    isDragDisabled={!isOnMain}
                    index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}>
                        <EvmSelectAccountSectionItemComponent
                          key={`option-${option.value.account.wallet.address!}`}
                          isLast={options.length - 1 === index}
                          item={option}
                          selectedAccount={
                            selectedAddress?.account.wallet.address!
                          }
                          handleItemClicked={(
                            value: EvmLocalAccountListItem['value']['account']['wallet']['address'],
                          ) => handleItemClicked(value)}
                          isOnMain={isOnMain}
                          dragHandle={provided.dragHandleProps}
                          closeDropdown={() => methods.dropDown('close')}
                        />
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
    );
  };
  return (
    <>
      {selectedAddress && options && (
        <div
          className={`evm-select-account-section ${
            fullSize ? 'fullsize' : ''
          } ${isOpened ? 'opened' : 'closed'} ${
            isOnMain ? 'main-page' : ''
          }`}>
          <Select
            keepOpen
            values={[selectedAddress as any]}
            options={options}
            onChange={() => undefined}
            contentRenderer={customLabelRender}
            className={`select-account-select ${background ? background : ''} ${
              removeBorder ? 'remove-border' : ''
            }`}
            dropdownHandleRenderer={customHandleRenderer}
            dropdownRenderer={customDropdownRenderer}
          />
          <div
            className={`overlay ${isOpened ? 'opened' : 'closed'}`}
            onClick={() => {
              setIsOpened(false);
            }}></div>
        </div>
      )}
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    accounts: state.evm.accounts,
    activeAccount: state.evm.activeAccount,
    chain: state.chain as EvmChain,
    mk: state.mk,
  };
};

const connector = connect(mapStateToProps, {
  loadEvmActiveAccount,
  setEvmAccounts,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmSelectAccountSectionComponent = connector(SelectAccountSection);
