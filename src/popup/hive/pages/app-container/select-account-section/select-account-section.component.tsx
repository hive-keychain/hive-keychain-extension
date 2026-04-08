import { LocalAccountListItem } from '@interfaces/list-item.interface';
import { setAccounts } from '@popup/hive/actions/account.actions';
import { SelectAccountSectionItemComponent } from '@popup/hive/pages/app-container/select-account-section/select-account-section-item.component';
import AccountUtils from '@popup/hive/utils/account.utils';
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
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import { loadActiveAccount } from 'src/popup/hive/actions/active-account.actions';

interface Props {
  background?: 'white';
  fullSize?: boolean;
  isOnMain?: boolean;
}

const buildAccountOptions = (
  localAccounts: LocalAccount[],
): LocalAccountListItem[] =>
  localAccounts.map((account: LocalAccount) => ({
    label: account.name,
    value: account.name,
  }));

const SelectAccountSection = ({
  background,
  fullSize,
  accounts,
  setAccounts,
  activeAccount,
  loadActiveAccount,
  isOnMain = false,
}: PropsFromRedux & Props) => {
  const [isOpened, setIsOpened] = useState(false);
  const isMountedRef = useRef(false);
  const setStateIfMounted = <
    TSetter extends React.Dispatch<React.SetStateAction<any>>,
  >(
    setter: TSetter,
    value: Parameters<TSetter>[0],
  ) => {
    if (!isMountedRef.current) {
      return;
    }
    setter(value);
  };
  const [options, setOptions] = useState<LocalAccountListItem[]>(() =>
    buildAccountOptions(accounts),
  );
  const [selectedLocalAccount, setSelectedLocalAccount] = useState(
    activeAccount.name ?? accounts[0]?.name,
  );

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setStateIfMounted(setOptions, buildAccountOptions(accounts));
    setStateIfMounted(
      setSelectedLocalAccount,
      activeAccount.name ?? accounts[0]?.name,
    );
  }, [accounts, activeAccount]);

  const handleItemClicked = (accountName: string) => {
    const itemClicked = accounts.find(
      (account: LocalAccount) => account.name === accountName,
    );
    if (!itemClicked) {
      return;
    }
    loadActiveAccount(itemClicked);
    handleClickOnSelector();
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const list = Array.from(options);
    const [removed] = list.splice(result.source.index, 1);
    list.splice(result.destination.index, 0, removed);
    setStateIfMounted(setOptions, list);

    setAccounts(
      AccountUtils.reorderAccounts(
        accounts,
        result.source.index,
        result.destination.index,
      ),
    );
  };

  const handleClickOnSelector = () => {
    setStateIfMounted(setIsOpened, (previousState) => !previousState);
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
        <PreloadedImage
          className="user-picture"
          src={`https://images.hive.blog/u/${selectedLocalAccount}/avatar`}
          alt={'/assets/images/placeholders/account-placeholder.png'}
          placeholder={'/assets/images/placeholders/account-placeholder.png'}
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
                {options.map((option, index) => (
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
                          isLast={options.length - 1 === index}
                          item={option}
                          selectedAccount={selectedLocalAccount}
                          handleItemClicked={(value) =>
                            handleItemClicked(value)
                          }
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
      {selectedLocalAccount && options && (
        <div
          className={`hive-select-account-section ${
            fullSize ? 'fullsize' : ''
          } ${isOpened ? 'opened' : 'closed'} ${
            isOnMain ? 'main-page' : ''
          }`}>
          <Select
            keepOpen
            values={[selectedLocalAccount as any]}
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
              setStateIfMounted(setIsOpened, false);
            }}></div>
        </div>
      )}
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    accounts: state.hive.accounts,
    activeAccount: state.hive.activeAccount,
  };
};

const connector = connect(mapStateToProps, {
  loadActiveAccount,
  setAccounts,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const SelectAccountSectionComponent = connector(SelectAccountSection);
