import { LocalAccountListItem } from '@interfaces/list-item.interface';
import { setAccounts } from '@popup/hive/actions/account.actions';
import { RootState } from '@popup/hive/store';
import AccountUtils from '@popup/hive/utils/account.utils';
import React, { useEffect, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from 'react-beautiful-dnd';
import Select, { SelectRenderer } from 'react-dropdown-select';
import { ConnectedProps, connect } from 'react-redux';
import { NewIcons } from 'src/common-ui/icons.enum';
import { SelectAccountSectionItemComponent } from 'src/common-ui/select-account-section/select-account-section-item.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import { loadActiveAccount } from 'src/popup/hive/actions/active-account.actions';
import { setInfoMessage } from 'src/popup/hive/actions/message.actions';

interface Props {
  background?: 'white';
  fullSize?: boolean;
  isOnMain?: boolean;
}

const SelectAccountSection = ({
  background,
  fullSize,
  accounts,
  setAccounts,
  activeAccount,
  loadActiveAccount,
  setInfoMessage,
  isOnMain = false,
}: PropsFromRedux & Props) => {
  const defaultOptions: LocalAccountListItem[] = [];

  useEffect(() => {
    setOptions(
      accounts.map((account: LocalAccount) => {
        return { label: account.name, value: account.name };
      }),
    );
    setSelectedLocalAccount(activeAccount.name!);
  }, [accounts, activeAccount]);

  const [options, setOptions] = useState(defaultOptions);
  const [selectedLocalAccount, setSelectedLocalAccount] = useState(
    accounts[0].name,
  );

  const handleItemClicked = (accountName: string) => {
    const itemClicked = accounts.find(
      (account: LocalAccount) => account.name === accountName,
    );
    loadActiveAccount(itemClicked!);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const list = Array.from(options);
    const [removed] = list.splice(result.source.index, 1);
    list.splice(result.destination.index, 0, removed);
    setOptions(list);
    setAccounts(
      AccountUtils.reorderAccounts(
        accounts,
        result.source.index,
        result.destination.index,
      ),
    );
  };
  const customLabelRender = (
    selectProps: SelectRenderer<LocalAccountListItem>,
  ) => {
    return (
      <div
        className={`selected-account-panel ${fullSize ? 'fullsize' : ''}`}
        onClick={() => {
          selectProps.methods.dropDown('close');
        }}>
        <img
          className="user-picture"
          src={`https://images.hive.blog/u/${selectedLocalAccount}/avatar`}
          onError={(e: any) => {
            e.target.onError = null;
            e.target.src = '/assets/images/accounts.png';
          }}
        />
        <div
          className="selected-account-name"
          data-testid="selected-account-name">
          {selectedLocalAccount}
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
        icon={
          state.dropdown ? NewIcons.SELECT_ARROW_UP : NewIcons.SELECT_ARROW_DOWN
        }
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
          <Droppable droppableId="droppable-account" type="account">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {properties.options.map((option, index) => (
                  <Draggable
                    key={option.value}
                    draggableId={option.value}
                    index={index}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.draggableProps}>
                        <SelectAccountSectionItemComponent
                          key={`option-${option.value}`}
                          isLast={options.length === index}
                          item={option}
                          selectedAccount={selectedLocalAccount}
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
      {selectedLocalAccount && options && (
        <div className={`select-account-section ${fullSize ? 'fullsize' : ''}`}>
          <Select
            values={[selectedLocalAccount as any]}
            options={options}
            onChange={() => undefined}
            contentRenderer={customLabelRender}
            className={`select-account-select ${background ? background : ''}`}
            dropdownHandleRenderer={customHandleRenderer}
            dropdownRenderer={customDropdownRenderer}
          />
        </div>
      )}
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    accounts: state.accounts,
    activeAccount: state.activeAccount,
  };
};

const connector = connect(mapStateToProps, {
  loadActiveAccount,
  setInfoMessage,
  setAccounts,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const SelectAccountSectionComponent = connector(SelectAccountSection);
