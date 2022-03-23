import { LocalAccountListItem } from '@interfaces/list-item.interface';
import { loadActiveAccount } from '@popup/actions/active-account.actions';
import { setInfoMessage } from '@popup/actions/message.actions';
import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import React, { BaseSyntheticEvent, useEffect, useState } from 'react';
import Select, {
  SelectItemRenderer,
  SelectRenderer,
} from 'react-dropdown-select';
import { connect, ConnectedProps } from 'react-redux';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import './select-account-section.component.scss';

const SelectAccountSection = ({
  accounts,
  activeAccount,
  loadActiveAccount,
  setInfoMessage,
}: PropsFromRedux) => {
  const defaultOptions: LocalAccountListItem[] = [];

  useEffect(() => {
    setOptions(
      accounts.map((account: LocalAccount) => {
        return { label: account.name, value: account.name };
      }),
    );
    setSelectedLocalAccount(activeAccount.name);
  }, [accounts, activeAccount]);

  const [options, setOptions] = useState(defaultOptions);
  const [selectedLocalAccount, setSelectedLocalAccount] = useState(
    accounts[0].name,
  );

  const handleItemClicked = (accountName: string) => {
    const itemClicked = accounts.find(
      (account: LocalAccount) => account.name === accountName,
    );
    loadActiveAccount(itemClicked);
  };

  const customLabelRender = (
    selectProps: SelectRenderer<LocalAccountListItem>,
  ) => {
    return (
      <div
        className="selected-account-panel"
        onClick={() => {
          selectProps.methods.dropDown('close');
        }}>
        <img
          src={`https://images.hive.blog/u/${selectedLocalAccount}/avatar`}
          onError={(e: any) => {
            e.target.onError = null;
            e.target.src = '/assets/images/accounts.png';
          }}
        />
        <div className="selected-account-name">{selectedLocalAccount}</div>
        <Icon
          additionalClassName="copy-username-button"
          name={Icons.COPY}
          type={IconType.OUTLINED}
          onClick={($event) => {
            copyUsernameToClipboard($event, selectedLocalAccount);
            selectProps.methods.dropDown('close');
          }}
          tooltipMessage="popup_html_copy_username_tooltip_text"
        />
      </div>
    );
  };
  const customItemRender = (
    selectProps: SelectItemRenderer<LocalAccountListItem>,
  ) => {
    return (
      <div
        className={`select-account-item ${
          selectedLocalAccount === selectProps.item.value ? 'selected' : ''
        }`}
        onClick={() => {
          handleItemClicked(selectProps.item.value);
          selectProps.methods.dropDown('close');
        }}>
        <img
          src={`https://images.hive.blog/u/${selectProps.item.label}/avatar`}
          onError={(e: any) => {
            e.target.onError = null;
            e.target.src = '/assets/images/accounts.png';
          }}
        />
        <div className="account-name">{selectProps.item.label}</div>
        <Icon
          additionalClassName="copy-username-button"
          name={Icons.COPY}
          type={IconType.OUTLINED}
          onClick={($event) => {
            copyUsernameToClipboard($event, selectProps.item.label);
            selectProps.methods.dropDown('close');
          }}
          tooltipMessage="popup_html_copy_username_tooltip_text"
        />
      </div>
    );
  };
  const copyUsernameToClipboard = (
    event: BaseSyntheticEvent,
    username: string,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    navigator.clipboard.writeText(activeAccount.name!);
    setInfoMessage('popup_html_text_copied', [username]);
  };

  return (
    <div>
      {selectedLocalAccount && options && (
        <div className="select-account-section">
          <Select
            values={[selectedLocalAccount]}
            options={options}
            onChange={() => undefined}
            contentRenderer={customLabelRender}
            itemRenderer={customItemRender}
            className="select-account-select"
          />
        </div>
      )}
    </div>
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
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const SelectAccountSectionComponent = connector(SelectAccountSection);
