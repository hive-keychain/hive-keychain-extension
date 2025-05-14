import { EvmLocalAccountListItem } from '@interfaces/list-item.interface';
import { loadEvmActiveAccount } from '@popup/evm/actions/active-account.actions';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmSelectAccountSectionItemComponent } from '@popup/evm/pages/home/evm-select-account-section/evm-select-account-section-item.component';
import { EvmAccountUtils } from '@popup/evm/utils/evm-account.utils';
import { setAccounts } from '@popup/hive/actions/account.actions';
import { setInfoMessage } from '@popup/multichain/actions/message.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
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
  loadEvmActiveAccount,
  setInfoMessage,
  isOnMain = false,
  removeBorder,
}: PropsFromRedux & Props) => {
  const defaultOptions: EvmLocalAccountListItem[] = [];

  const [isOpened, setIsOpened] = useState(false);
  const [options, setOptions] = useState(defaultOptions);
  const [selectedAddress, setSelectedAddress] = useState<EvmAccount>();

  useEffect(() => {
    if (accounts && activeAccount.address) {
      const opts = accounts
        .filter((account) => !account.hide)
        .map((account: EvmAccount) => {
          return {
            label: account.wallet.address,
            value: account,
          };
        });

      setOptions(opts);
      const selectedOption = opts.find((opt) => {
        return opt.value.wallet.address === activeAccount.wallet.address;
      });
      setSelectedAddress(selectedOption!.value);
    }
  }, [accounts, activeAccount]);

  const handleItemClicked = (address: string) => {
    const itemClicked = accounts.find(
      (account: EvmAccount) => account.wallet.address === address,
    );
    if (itemClicked) {
      loadEvmActiveAccount(chain, itemClicked?.wallet);
      handleClickOnSelector();
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const list = Array.from(options);
    const [removed] = list.splice(result.source.index, 1);
    list.splice(result.destination.index, 0, removed);
    setOptions(list);
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
        <EvmAccountImage address={selectedAddress?.wallet.address} />
        <div
          className="selected-account-name"
          data-testid="selected-account-name">
          <div className="seed-name">
            {EvmAccountUtils.getSeedName(selectedAddress!)}
          </div>
          <div className="address-name">
            {selectedAddress?.nickname ?? 'No name'}
          </div>
          <div className="address">
            {FormatUtils.shortenString(selectedAddress?.wallet.address!, 4)}
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
    props: properties,
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
                {properties.options.map((option, index) => (
                  <Draggable
                    key={option.value.wallet.address}
                    draggableId={option.value.wallet.address}
                    isDragDisabled={!isOnMain}
                    index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}>
                        <EvmSelectAccountSectionItemComponent
                          key={`option-${option.value.wallet.address!}`}
                          isLast={options.length === index}
                          item={option}
                          selectedAccount={selectedAddress?.wallet.address!}
                          handleItemClicked={(
                            value: EvmLocalAccountListItem['value']['wallet']['address'],
                          ) => handleItemClicked(value)}
                          isOnMain={isOnMain}
                          dragHandle={provided.dragHandleProps}
                          closeDropdown={() => methods.dropDown('close')}
                          setInfoMessage={setInfoMessage}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
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
          } ${isOpened ? 'opened' : 'closed'}`}>
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
    chain: state.chain,
  };
};

const connector = connect(mapStateToProps, {
  loadEvmActiveAccount,
  setInfoMessage,
  setAccounts,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmSelectAccountSectionComponent = connector(SelectAccountSection);
