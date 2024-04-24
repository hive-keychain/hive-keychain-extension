import { LocalAccountListItem } from '@interfaces/list-item.interface';
import { getEvmActiveAccount } from '@popup/evm/actions/active-account.actions';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { setAccounts } from '@popup/hive/actions/account.actions';
import { SelectAccountSectionItemComponent } from '@popup/hive/pages/app-container/select-account-section/select-account-section-item.component';
import { setInfoMessage } from '@popup/multichain/actions/message.actions';
import { RootState } from '@popup/multichain/store';
import { identicon } from 'minidenticons';
import React, { useEffect, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from 'react-beautiful-dnd';
import Select, { SelectRenderer } from 'react-dropdown-select';
import { ConnectedProps, connect } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

interface Props {
  background?: 'white';
  fullSize?: boolean;
  isOnMain?: boolean;
}

const SelectAccountSection = ({
  background,
  fullSize,
  accounts,
  activeAccount,
  getEvmActiveAccount,
  setInfoMessage,
  isOnMain = false,
}: PropsFromRedux & Props) => {
  const defaultOptions: LocalAccountListItem[] = [];

  const [isOpened, setIsOpened] = useState(false);
  const [options, setOptions] = useState(defaultOptions);
  const [selectedAddress, setSelectedAddress] = useState(
    accounts[0].wallet.address,
  );

  useEffect(() => {
    setOptions(
      accounts.map((account: EvmAccount) => {
        return { label: account.wallet.address, value: account.wallet.address };
      }),
    );
    setSelectedAddress(accounts[0].wallet.address);
  }, [accounts, activeAccount]);

  const handleItemClicked = (address: string) => {
    const itemClicked = accounts.find(
      (account: EvmAccount) => account.wallet.address === address,
    );
    // getEvmActiveAccount(itemClicked!);
    handleClickOnSelector();
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const list = Array.from(options);
    const [removed] = list.splice(result.source.index, 1);
    list.splice(result.destination.index, 0, removed);
    setOptions(list);
    // setAccounts(
    //   AccountUtils.reorderAccounts(
    //     accounts,
    //     result.source.index,
    //     result.destination.index,
    //   ),
    // );
  };

  const handleClickOnSelector = () => {
    setIsOpened(!isOpened);
  };

  const customLabelRender = (
    selectProps: SelectRenderer<LocalAccountListItem>,
  ) => {
    return (
      <div
        className={`selected-account-panel ${fullSize ? 'fullsize' : ''}`}
        onClick={() => {
          handleClickOnSelector();
        }}>
        <div
          className="user-picture"
          dangerouslySetInnerHTML={{
            __html: identicon(selectedAddress, 90, 50),
          }}
        />
        <div
          className="selected-account-name"
          data-testid="selected-account-name">
          {`${selectedAddress?.substring(4, 0)}...${selectedAddress
            ?.toString()
            .slice(-4)}`}
        </div>
      </div>
    );
  };

  const customHandleRenderer = ({
    props,
    state,
    methods,
  }: SelectRenderer<LocalAccountListItem>) => {
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
  }: SelectRenderer<LocalAccountListItem>) => {
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
                    key={option.value}
                    draggableId={option.value}
                    isDragDisabled={!isOnMain}
                    index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}>
                        <SelectAccountSectionItemComponent
                          key={`option-${option.value}`}
                          isLast={options.length === index}
                          item={option}
                          selectedAccount={selectedAddress}
                          handleItemClicked={(value) =>
                            handleItemClicked(value)
                          }
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
          className={`select-account-section ${fullSize ? 'fullsize' : ''} ${
            isOpened ? 'opened' : 'closed'
          }`}>
          <Select
            keepOpen
            values={[selectedAddress as any]}
            options={options}
            onChange={() => undefined}
            contentRenderer={customLabelRender}
            className={`select-account-select ${background ? background : ''}`}
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
  };
};

const connector = connect(mapStateToProps, {
  getEvmActiveAccount,
  setInfoMessage,
  setAccounts,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmSelectAccountSectionComponent = connector(SelectAccountSection);
