import { LocalAccountListItem } from '@interfaces/list-item.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { loadActiveAccount } from '@popup/actions/active-account.actions';
import { RootState } from '@popup/store';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import React, { useEffect, useState } from 'react';
import Select, {
  SelectItemRenderer,
  SelectRenderer,
} from 'react-dropdown-select';
import { connect, ConnectedProps } from 'react-redux';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import SwitchComponent from 'src/common-ui/switch/switch.component';
import AutomatedTasksUtils from 'src/utils/automatedTasks.utils';
import './automated-tasks.component.scss';

const AutomatedTasks = ({ accounts, activeAccount }: PropsFromRedux) => {
  const defaultOptions: LocalAccountListItem[] = [];
  const [options, setOptions] = useState(defaultOptions);
  const [claimRewards, setClaimRewards] = useState(false);
  const [claimAccounts, setClaimAccounts] = useState(false);
  const [selectedLocalAccount, setSelectedLocalAccount] = useState(
    accounts[0].name,
  );

  useEffect(() => {
    init();
    setOptions(
      accounts.map((account: LocalAccount) => {
        return { label: account.name, value: account.name };
      }),
    );

    setSelectedLocalAccount(activeAccount.name);
  }, [accounts, activeAccount]);

  useEffect(() => {
    AutomatedTasksUtils.saveClaims(
      claimRewards,
      claimAccounts,
      activeAccount.name!,
    );
    chrome.runtime.sendMessage({
      command: BackgroundCommand.UPDATE_CLAIMS,
      value: {
        [activeAccount.name!]: {
          claimRewards: claimRewards,
          claimAccounts: claimAccounts,
        },
      },
    });
  }, [claimAccounts, claimRewards]);

  const init = async () => {
    const test = await AutomatedTasksUtils.getClaims(activeAccount.name!);
    console.log(test);
  };

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
      </div>
    );
  };

  return (
    <div className="automated-tasks-page">
      <PageTitleComponent
        title="popup_html_automated_tasks"
        isBackButtonEnabled={true}
      />

      <div className="intro">
        {chrome.i18n.getMessage('popup_html_automated_intro')}
      </div>

      <div className="select">
        <Select
          values={[selectedLocalAccount]}
          options={options}
          onChange={() => undefined}
          contentRenderer={customLabelRender}
          itemRenderer={customItemRender}
          className="select-account-select"
        />
      </div>

      <SwitchComponent
        title="popup_html_enable_autoclaim_rewards"
        checked={claimRewards}
        onChange={setClaimRewards}
        hint="popup_html_enable_autoclaim_rewards_info"></SwitchComponent>

      <SwitchComponent
        title="popup_html_enable_autoclaim_accounts"
        checked={claimAccounts}
        onChange={setClaimAccounts}
        hint="popup_html_enable_autoclaim_accounts_info"></SwitchComponent>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { accounts: state.accounts, activeAccount: state.activeAccount };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AutomatedTasksComponent = connector(AutomatedTasks);
