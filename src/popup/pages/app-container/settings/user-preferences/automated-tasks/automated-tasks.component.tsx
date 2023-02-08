import { LocalAccountListItem } from '@interfaces/list-item.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { loadActiveAccount } from '@popup/actions/active-account.actions';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { RootState } from '@popup/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import Select, {
  SelectItemRenderer,
  SelectRenderer,
} from 'react-dropdown-select';
import { connect, ConnectedProps } from 'react-redux';
import CheckboxComponent from 'src/common-ui/checkbox/checkbox.component';
import Config from 'src/config';
import AutomatedTasksUtils from 'src/utils/automatedTasks.utils';
import './automated-tasks.component.scss';

const AutomatedTasks = ({
  accounts,
  activeAccount,
  loadActiveAccount,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const defaultOptions: LocalAccountListItem[] = [];
  const [options, setOptions] = useState(defaultOptions);
  const [claimRewards, setClaimRewards] = useState(false);
  const [claimAccounts, setClaimAccounts] = useState(false);
  const [claimSavings, setClaimSavings] = useState(false);
  const [selectedLocalAccount, setSelectedLocalAccount] = useState(
    accounts[0].name,
  );

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_automated_tasks',
      isBackButtonEnabled: true,
    });
  }, []);

  useEffect(() => {
    init();
    setOptions(
      accounts.map((account: LocalAccount) => {
        return { label: account.name, value: account.name };
      }),
    );

    setSelectedLocalAccount(activeAccount.name!);
  }, [accounts, activeAccount]);

  const saveClaims = async (
    claimRewards: boolean,
    claimAccounts: boolean,
    claimSavings: boolean,
  ) => {
    setClaimAccounts(claimAccounts);
    setClaimRewards(claimRewards);
    setClaimSavings(claimSavings);

    await AutomatedTasksUtils.saveClaims(
      claimRewards,
      claimAccounts,
      claimSavings,
      activeAccount.name!,
    );
  };

  const init = async () => {
    const values = await AutomatedTasksUtils.getClaims(activeAccount.name!);
    setClaimRewards(values[LocalStorageKeyEnum.CLAIM_REWARDS] ?? false);
    setClaimAccounts(values[LocalStorageKeyEnum.CLAIM_ACCOUNTS] ?? false);
    setClaimSavings(values[LocalStorageKeyEnum.CLAIM_SAVINGS] ?? false);
  };

  const handleItemClicked = (accountName: string) => {
    const itemClicked = accounts.find(
      (account: LocalAccount) => account.name === accountName,
    );
    loadActiveAccount(itemClicked!);
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
        aria-label={`select-account-item-${selectProps.item.label}`}
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
    <div aria-label="automated-tasks-page" className="automated-tasks-page">
      <div className="intro">
        {chrome.i18n.getMessage('popup_html_automated_intro')}
      </div>

      <div className="select">
        <Select
          values={[selectedLocalAccount as any]}
          options={options}
          onChange={() => undefined}
          contentRenderer={customLabelRender}
          itemRenderer={customItemRender}
          className="select-account-select"
        />
      </div>

      <CheckboxComponent
        ariaLabel="checkbox-autoclaim-rewards"
        title="popup_html_enable_autoclaim_rewards"
        checked={claimRewards}
        onChange={(value) => saveClaims(value, claimAccounts, claimSavings)}
        hint="popup_html_enable_autoclaim_rewards_info"
      />
      {activeAccount.rc.max_mana > Config.claims.freeAccount.MIN_RC && (
        <CheckboxComponent
          ariaLabel="checkbox-autoclaim-accounts"
          title="popup_html_enable_autoclaim_accounts"
          checked={claimAccounts}
          onChange={(value) => saveClaims(claimRewards, value, claimSavings)}
          skipHintTranslation
          hint={chrome.i18n.getMessage(
            'popup_html_enable_autoclaim_accounts_info',
            [Config.claims.freeAccount.MIN_RC_PCT + ''],
          )}
        />
      )}
      <CheckboxComponent
        ariaLabel="checkbox-autoclaim-savings"
        title="popup_html_enable_autoclaim_savings"
        checked={claimSavings}
        onChange={(value) => saveClaims(claimRewards, claimAccounts, value)}
        hint="popup_html_enable_autoclaim_savings_info"
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { accounts: state.accounts, activeAccount: state.activeAccount };
};

const connector = connect(mapStateToProps, {
  loadActiveAccount,
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AutomatedTasksComponent = connector(AutomatedTasks);
