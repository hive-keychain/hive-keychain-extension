import { LocalAccountListItem } from '@interfaces/list-item.interface';
import { setAccounts } from '@popup/hive/actions/account.actions';
import { setActiveAccountType } from '@popup/multichain/actions/active-account-type.actions';
import { SelectAccountSectionItemComponent } from '@popup/hive/pages/app-container/select-account-section/select-account-section-item.component';
import { HiveScreen } from '@popup/hive/reference-data/hive-screen.enum';
import AccountUtils from '@popup/hive/utils/account.utils';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { ChainType } from '@popup/multichain/interfaces/chains.interface';
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
  hideManageAccountsOption?: boolean;
  selectedAccountName?: string;
  onAccountSelected?: (accountName: string) => void;
}

interface AccountActionLink {
  icon: SVGIcons;
  label: string;
  screen: HiveScreen;
  testId: string;
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
  setActiveAccountType,
  navigateTo,
  isOnMain = false,
  hideManageAccountsOption = false,
  selectedAccountName: controlledSelectedAccountName,
  onAccountSelected,
}: PropsFromRedux & Props) => {
  const isControlledSelection =
    controlledSelectedAccountName !== undefined &&
    onAccountSelected !== undefined;

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

  const displayedAccountName = isControlledSelection
    ? controlledSelectedAccountName
    : selectedLocalAccount;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setStateIfMounted(setOptions, buildAccountOptions(accounts));
    if (!isControlledSelection) {
      setStateIfMounted(
        setSelectedLocalAccount,
        activeAccount.name ?? accounts[0]?.name,
      );
    }
  }, [accounts, activeAccount, isControlledSelection]);

  const handleItemClicked = (accountName: string) => {
    const itemClicked = accounts.find(
      (account: LocalAccount) => account.name === accountName,
    );
    if (!itemClicked) {
      return;
    }
    if (isControlledSelection) {
      onAccountSelected(accountName);
    } else {
      setActiveAccountType(ChainType.HIVE);
      loadActiveAccount(itemClicked);
    }
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
          src={`https://images.hive.blog/u/${displayedAccountName}/avatar`}
          alt={'/assets/images/placeholders/account-placeholder.png'}
          placeholder={'/assets/images/placeholders/account-placeholder.png'}
        />
        <div
          className="selected-account-name"
          data-testid="selected-account-name">
          {displayedAccountName}
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
    const accountActionLinks: AccountActionLink[] = [
      {
        icon: SVGIcons.MENU_ACCOUNTS_ADD_ACCOUNT,
        label: 'popup_html_add_account',
        screen: HiveScreen.SETTINGS_ADD_ACCOUNT,
        testId: 'add-account-dropdown-option',
      },
      {
        icon: SVGIcons.MENU_ACCOUNTS_CREATE_ACCOUNT,
        label: 'popup_html_create_account',
        screen: HiveScreen.CREATE_ACCOUNT_PAGE_STEP_ONE,
        testId: 'create-account-dropdown-option',
      },
      ...(hideManageAccountsOption
        ? []
        : [
            {
              icon: SVGIcons.MENU_ACCOUNTS_MANAGE_ACCOUNTS,
              label: 'manage_accounts',
              screen: HiveScreen.SETTINGS_MANAGE_ACCOUNTS,
              testId: 'manage-accounts-dropdown-option',
            },
          ]),
    ];

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
                          selectedAccount={displayedAccountName}
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
        {accountActionLinks.map((actionLink) => (
          <div
            key={actionLink.testId}
            className="manage-accounts-panel"
            data-testid={actionLink.testId}
            onClick={() => {
              navigateTo(actionLink.screen);
            }}>
            <SVGIcon icon={actionLink.icon} />
            <div className="text">
              {chrome.i18n.getMessage(actionLink.label)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {displayedAccountName && options && (
        <div
          className={`hive-select-account-section ${
            fullSize ? 'fullsize' : ''
          } ${isOpened ? 'opened' : 'closed'} ${isOnMain ? 'main-page' : ''}`}>
          <Select
            keepOpen
            values={[displayedAccountName as any]}
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
  setActiveAccountType,
  navigateTo,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const SelectAccountSectionComponent = connector(SelectAccountSection);
