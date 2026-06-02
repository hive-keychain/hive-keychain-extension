import {
  ComplexeCustomSelect,
  OptionItem,
} from '@common-ui/custom-select/custom-select.component';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { Screen } from '@interfaces/screen.interface';
import {
  loadTokens,
  loadTokensMarket,
  loadUserTokens,
} from '@popup/hive/actions/token.actions';
import AccountUtils from '@popup/hive/utils/account.utils';
import TokensUtils from '@popup/hive/utils/tokens.utils';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { CheckboxPanelComponent } from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import Config from 'src/config';
import AutomatedTasksUtils from 'src/utils/automatedTasks.utils';

const DEFAULT_SELECTED_TOKEN_OPTION = {
  label: chrome.i18n.getMessage(
    'popup_html_automated_hive_section_default_option_message',
  ),
  value: '',
};

type HiveAccountOption = OptionItem & {
  value: string;
};

const AutomatedTasks = ({
  accounts,
  activeAccountName,
  userTokens,
  market,
  allTokens,
  setTitleContainerProperties,
  loadUserTokens,
  loadTokensMarket,
  loadTokens,
}: PropsFromRedux) => {
  const [claimRewards, setClaimRewards] = useState(false);
  const [claimAccounts, setClaimAccounts] = useState(false);
  const [claimSavings, setClaimSavings] = useState(false);
  const [enabledAutoStake, setEnabledAutoStake] = useState(false);
  const [selectedAccountName, setSelectedAccountName] = useState(
    activeAccountName ?? accounts[0]?.name,
  );
  const [selectedAccountContext, setSelectedAccountContext] = useState<
    ActiveAccount | undefined
  >();
  const [isHiveSectionExpanded, setIsHiveSectionExpanded] = useState(true);
  const [isHiveEngineSectionExpanded, setIsHiveEngineSectionExpanded] =
    useState(false);
  const [userTokenOptionList, setUserTokenOptionList] =
    useState<OptionItem[]>();
  const [selectedUserTokenOption, setSelectedUserTokenOption] =
    useState<OptionItem>(DEFAULT_SELECTED_TOKEN_OPTION);
  const [autoStakeTokenList, setAutoStakeTokenList] = useState<OptionItem[]>(
    [],
  );

  const accountOptions: HiveAccountOption[] = accounts.map((account) => ({
    label: account.name,
    value: account.name,
    img: `https://images.hive.blog/u/${account.name}/avatar`,
  }));
  const selectedAccountOption = accountOptions.find(
    (accountOption) => accountOption.value === selectedAccountName,
  );

  const claimSavingsErrorMessage = selectedAccountContext
    ? AutomatedTasksUtils.canClaimSavingsErrorMessage(selectedAccountContext)
    : undefined;
  const claimAccountErrorMessage = selectedAccountContext
    ? AutomatedTasksUtils.canClaimAccountErrorMessage(selectedAccountContext)
    : undefined;
  const claimRewardsErrorMessage = selectedAccountContext
    ? AutomatedTasksUtils.canClaimRewardsErrorMessage(selectedAccountContext)
    : undefined;

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_automated_tasks',
      isBackButtonEnabled: true,
    });
    loadTokensMarket();
    loadTokens();
  }, []);

  useEffect(() => {
    if (!selectedAccountName && activeAccountName) {
      setSelectedAccountName(activeAccountName);
    }
  }, [activeAccountName, selectedAccountName]);

  useEffect(() => {
    if (
      selectedAccountName &&
      accountOptions.some(
        (accountOption) => accountOption.value === selectedAccountName,
      )
    ) {
      return;
    }

    setSelectedAccountName(activeAccountName ?? accounts[0]?.name);
  }, [accounts, activeAccountName, selectedAccountName]);

  useEffect(() => {
    if (!selectedAccountName) {
      setSelectedAccountContext(undefined);
      return;
    }

    let cancelled = false;

    const loadSelectedAccountContext = async () => {
      const localAccount = accounts.find(
        (account) => account.name === selectedAccountName,
      );
      if (!localAccount) {
        if (!cancelled) {
          setSelectedAccountContext(undefined);
        }
        return;
      }

      const rc = await AccountUtils.getRCMana(selectedAccountName);
      if (cancelled) {
        return;
      }

      setSelectedAccountContext({
        name: selectedAccountName,
        keys: localAccount.keys,
        rc,
        account: {} as ActiveAccount['account'],
      });
    };

    void loadSelectedAccountContext();

    return () => {
      cancelled = true;
    };
  }, [accounts, selectedAccountName]);

  useEffect(() => {
    if (!selectedAccountName) {
      return;
    }

    setSelectedUserTokenOption(DEFAULT_SELECTED_TOKEN_OPTION);
    setAutoStakeTokenList([]);
    void init(selectedAccountName);
    loadUserTokens(selectedAccountName);
  }, [selectedAccountName]);

  useEffect(() => {
    if (!userTokens.loading && userTokens.list && market) {
      const orderedFiltered = userTokens.list.sort(
        (a, b) =>
          TokensUtils.getHiveEngineTokenValue(b, market, undefined, allTokens) -
          TokensUtils.getHiveEngineTokenValue(a, market, undefined, allTokens),
      );

      const list = orderedFiltered
        .filter((token) =>
          allTokens.find(
            (tokenInfo) =>
              tokenInfo.symbol === token.symbol && tokenInfo.stakingEnabled,
          ),
        )
        .map((token) => {
          const tokenInfo = allTokens.find(
            (tokenDefinition) =>
              tokenDefinition.symbol === token.symbol &&
              tokenDefinition.stakingEnabled === true,
          );
          let img = '';
          let imgBackup = '';
          if (tokenInfo) {
            img =
              tokenInfo.metadata.icon && tokenInfo.metadata.icon.length > 0
                ? tokenInfo.metadata.icon
                : '/assets/images/wallet/hive-engine.svg';
            imgBackup = '/assets/images/wallet/hive-engine.svg';
          }
          return {
            value: token,
            label: token.symbol,
            img: img,
            imgBackup,
          };
        });

      setUserTokenOptionList(list);
    }
  }, [userTokens, market, allTokens]);

  const saveClaims = async (
    nextClaimRewards: boolean,
    nextClaimAccounts: boolean,
    nextClaimSavings: boolean,
  ) => {
    if (!selectedAccountName) {
      return;
    }

    setClaimAccounts(nextClaimAccounts);
    setClaimRewards(nextClaimRewards);
    setClaimSavings(nextClaimSavings);

    await AutomatedTasksUtils.saveClaims(
      nextClaimRewards,
      nextClaimAccounts,
      nextClaimSavings,
      selectedAccountName,
    );
  };

  useEffect(() => {
    if (
      userTokenOptionList &&
      userTokenOptionList.length > 0 &&
      enabledAutoStake &&
      selectedAccountName
    ) {
      void initAutoStakeTokens(selectedAccountName);
    }
  }, [userTokenOptionList, enabledAutoStake, selectedAccountName]);

  const initAutoStakeTokens = async (accountName: string) => {
    const autoStakeUsernameList =
      await AutomatedTasksUtils.getUsernameAutoStakeList(accountName);
    const autoStakeUsernameOptionItemList: OptionItem[] =
      autoStakeUsernameList.length > 0
        ? userTokenOptionList!.filter((userTokenOption) =>
            autoStakeUsernameList.find(
              (autoStakeToken: { symbol: string }) =>
                autoStakeToken.symbol === userTokenOption.value.symbol,
            ),
          )
        : [];
    setAutoStakeTokenList(autoStakeUsernameOptionItemList);
  };

  const init = async (accountName: string) => {
    const values = await AutomatedTasksUtils.getClaims(accountName);
    setClaimRewards(values[LocalStorageKeyEnum.CLAIM_REWARDS] ?? false);
    setClaimAccounts(values[LocalStorageKeyEnum.CLAIM_ACCOUNTS] ?? false);
    setClaimSavings(values[LocalStorageKeyEnum.CLAIM_SAVINGS] ?? false);
    setEnabledAutoStake(
      await AutomatedTasksUtils.getUsernameAutoStake(accountName),
    );
  };

  const handleSetSelectedToken = async (selected: OptionItem) => {
    if (!selectedAccountName) {
      return;
    }

    setSelectedUserTokenOption(DEFAULT_SELECTED_TOKEN_OPTION);
    if (
      !autoStakeTokenList?.find(
        (autoStakeToken) =>
          autoStakeToken.value.symbol === selected.value.symbol,
      )
    ) {
      const copyAutoStakeList = [...autoStakeTokenList];
      copyAutoStakeList.unshift(selected);
      await setAndSaveAutoStakeTokenList(copyAutoStakeList);
    }
  };

  const setAndSaveAutoStakeTokenList = async (autoStakeData: OptionItem[]) => {
    if (!selectedAccountName) {
      return;
    }

    setAutoStakeTokenList(autoStakeData);
    await AutomatedTasksUtils.updateAutoStakeTokenList(
      selectedAccountName,
      autoStakeData,
    );
  };

  const handleRemoveItem = async (item: OptionItem) => {
    if (autoStakeTokenList.find((a) => a.value.symbol === item.value.symbol)) {
      const copyAutoStakeList = [...autoStakeTokenList].filter(
        (autoStakeToken) => autoStakeToken.value.symbol !== item.value.symbol,
      );
      await setAndSaveAutoStakeTokenList(copyAutoStakeList);
    }
  };

  const handleSetAutoStake = async (enable: boolean) => {
    if (!selectedAccountName) {
      return;
    }

    setEnabledAutoStake(enable);
    await AutomatedTasksUtils.saveUsernameAutoStake(
      selectedAccountName,
      enable,
    );
  };

  const isClaimedAccountDisabled =
    (selectedAccountContext?.rc.max_rc ?? 0) <
    Config.claims.freeAccount.MIN_RC * 1.5;

  return (
    <div
      data-testid={`${Screen.SETTINGS_AUTOMATED_TASKS}-page`}
      className="automated-tasks-page">
      <div className="intro">
        {chrome.i18n.getMessage('popup_html_automated_intro')}
      </div>

      {selectedAccountOption && (
        <div className="settings-hive-account-select-panel">
          <ComplexeCustomSelect
            options={accountOptions}
            selectedItem={selectedAccountOption}
            setSelectedItem={(option) => setSelectedAccountName(option.value)}
            background="white"
          />
        </div>
      )}

      <div className="section">
        <div className="section-header">
          <div className="section-title-logo">
            <div className="section-title">
              {chrome.i18n.getMessage(
                'popup_html_automated_hive_section_title',
              )}
            </div>
          </div>
        </div>
        <div className="tasks">
          <CheckboxPanelComponent
            dataTestId="checkbox-autoclaim-rewards"
            title="popup_html_enable_autoclaim_rewards"
            checked={claimRewards}
            onChange={(value) => saveClaims(value, claimAccounts, claimSavings)}
            hint="popup_html_enable_autoclaim_rewards_info"
            tooltipMessage={claimRewardsErrorMessage}
            disabled={!!claimRewardsErrorMessage}
          />
          <CheckboxPanelComponent
            dataTestId="checkbox-autoclaim-accounts"
            title="popup_html_enable_autoclaim_accounts"
            checked={claimAccounts && !isClaimedAccountDisabled}
            onChange={(value) => saveClaims(claimRewards, value, claimSavings)}
            skipHintTranslation
            hint={chrome.i18n.getMessage(
              'popup_html_enable_autoclaim_accounts_info',
              [Config.claims.freeAccount.MIN_RC_PCT + ''],
            )}
            tooltipMessage={
              claimAccountErrorMessage || isClaimedAccountDisabled
                ? 'popup_html_insufficient_hp_claim_accounts'
                : undefined
            }
            disabled={!!claimSavingsErrorMessage || isClaimedAccountDisabled}
          />
          <CheckboxPanelComponent
            dataTestId="checkbox-autoclaim-savings"
            title="popup_html_enable_autoclaim_savings"
            checked={claimSavings}
            onChange={(value) => saveClaims(claimRewards, claimAccounts, value)}
            hint="popup_html_enable_autoclaim_savings_info"
            tooltipMessage={claimSavingsErrorMessage}
            disabled={!!claimSavingsErrorMessage}
          />
        </div>
      </div>
      <div className="section">
        <div className="section-header">
          <div className="section-title-logo">
            <div className="section-title">
              {chrome.i18n.getMessage(
                'popup_html_automated_hive_engine_section_title',
              )}
            </div>
            {userTokens.loading && (
              <div className="rotating-logo-container">
                <RotatingLogoComponent />
              </div>
            )}
          </div>
        </div>
        <div className="tasks">
          <CheckboxPanelComponent
            dataTestId="checkbox-autostake-tokens"
            title="popup_html_enable_autostake_tokens"
            checked={enabledAutoStake}
            onChange={handleSetAutoStake}
            hint="popup_html_enable_autostake_tokens_info"
          />
          {selectedUserTokenOption &&
            userTokenOptionList?.length &&
            enabledAutoStake && (
              <ComplexeCustomSelect
                selectedItem={selectedUserTokenOption}
                options={userTokenOptionList.filter(
                  (u) =>
                    !autoStakeTokenList.find(
                      (a) => a.value.symbol === u.value.symbol,
                    ),
                )}
                setSelectedItem={handleSetSelectedToken}
                label="tokens"
                filterable
                rightActionIcon
                rightActionClicked={() => {}}
              />
            )}
          {autoStakeTokenList.length > 0 && enabledAutoStake && (
            <>
              <div className="intro title-list">
                {chrome.i18n.getMessage(
                  'popup_html_automated_hive_engine_list_title',
                )}
              </div>
              <div className="auto-stake-token-list">
                {autoStakeTokenList.map((o, index) => (
                  <button
                    type="button"
                    key={`option-${o.label}`}
                    className="auto-stake-token-tag"
                    onClick={() => handleRemoveItem(o)}>
                    {o.img && (
                      <img
                        className="token-img"
                        src={o.img}
                        onError={(e: any) => {
                          e.target.onError = null;
                          e.target.src = o.imgBackup;
                        }}
                      />
                    )}
                    <span className="token-label">{o.label}</span>
                    <SVGIcon icon={SVGIcons.SELECT_DELETE} />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    accounts: state.hive.accounts,
    activeAccountName: state.hive.activeAccount.name,
    userTokens: state.hive.userTokens,
    market: state.hive.tokenMarket,
    allTokens: state.hive.tokens,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  loadUserTokens,
  loadTokensMarket,
  loadTokens,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AutomatedTasksComponent = connector(AutomatedTasks);
