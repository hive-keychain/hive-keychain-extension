import { LocalAccountListItem } from '@interfaces/list-item.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import {
  loadTokens,
  loadTokensMarket,
  loadUserTokens,
} from '@popup/hive/actions/token.actions';
import TokensUtils from '@popup/hive/utils/tokens.utils';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useState } from 'react';
import { SelectItemRenderer, SelectRenderer } from 'react-dropdown-select';
import { ConnectedProps, connect } from 'react-redux';
import { CheckboxPanelComponent } from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { CustomSelectItemComponent } from 'src/common-ui/custom-select/custom-select-item.component';
import {
  ComplexeCustomSelect,
  OptionItem,
} from 'src/common-ui/custom-select/custom-select.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { SelectAccountSectionComponent } from 'src/common-ui/select-account-section/select-account-section.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import Config from 'src/config';
import { loadActiveAccount } from 'src/popup/hive/actions/active-account.actions';
import AutomatedTasksUtils from 'src/utils/automatedTasks.utils';

const DEFAULT_SELECTED_TOKEN_OPTION = {
  label: chrome.i18n.getMessage(
    'popup_html_automated_hive_section_default_option_message',
  ),
  value: '',
};

const AutomatedTasks = ({
  accounts,
  activeAccount,
  userTokens,
  market,
  allTokens,
  loadActiveAccount,
  setTitleContainerProperties,
  loadUserTokens,
  loadTokensMarket,
  loadTokens,
}: PropsFromRedux) => {
  const defaultOptions: LocalAccountListItem[] = [];
  const [options, setOptions] = useState(defaultOptions);
  const [claimRewards, setClaimRewards] = useState(false);
  const [claimAccounts, setClaimAccounts] = useState(false);
  const [claimSavings, setClaimSavings] = useState(false);
  const [enabledAutoStake, setEnabledAutoStake] = useState(false);
  const [selectedLocalAccount, setSelectedLocalAccount] = useState(
    accounts[0].name,
  );
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
  const claimSavingsErrorMessage =
    AutomatedTasksUtils.canClaimSavingsErrorMessage(activeAccount);
  const claimAccountErrorMessage =
    AutomatedTasksUtils.canClaimAccountErrorMessage(activeAccount);
  const claimRewardsErrorMessage =
    AutomatedTasksUtils.canClaimRewardsErrorMessage(activeAccount);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_automated_tasks',
      isBackButtonEnabled: true,
    });
  }, []);

  useEffect(() => {
    setSelectedUserTokenOption(DEFAULT_SELECTED_TOKEN_OPTION);
    setAutoStakeTokenList([]);
    init();
    setOptions(
      accounts.map((account: LocalAccount) => {
        return { label: account.name, value: account.name };
      }),
    );
    setSelectedLocalAccount(activeAccount.name!);
    loadTokensMarket();
    loadTokens();
  }, [accounts, activeAccount]);

  useEffect(() => {
    if (selectedLocalAccount) {
      loadUserTokens(selectedLocalAccount);
    }
  }, [selectedLocalAccount]);

  useEffect(() => {
    if (!userTokens.loading && userTokens.list && market) {
      const orderedFiltered = userTokens.list.sort(
        (a, b) =>
          TokensUtils.getHiveEngineTokenValue(b, market, undefined, allTokens) -
          TokensUtils.getHiveEngineTokenValue(a, market, undefined, allTokens),
      );

      let list = orderedFiltered
        .filter((o) =>
          allTokens.find((a) => a.symbol === o.symbol && a.stakingEnabled),
        )
        .map((token) => {
          const tokenInfo = allTokens.find(
            (t) => t.symbol === token.symbol && t.stakingEnabled === true,
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

      if (list) {
        setUserTokenOptionList(list);
      }
    }
  }, [userTokens, market]);

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

  useEffect(() => {
    if (
      userTokenOptionList &&
      userTokenOptionList?.length > 0 &&
      enabledAutoStake
    ) {
      initAutoStakeTokens();
    }
  }, [userTokenOptionList, enabledAutoStake]);

  const initAutoStakeTokens = async () => {
    let autoStakeUsernameList: any =
      await AutomatedTasksUtils.getUsernameAutoStakeList(activeAccount.name!);
    let autoStakeUsernameOptionItemList: OptionItem[] =
      autoStakeUsernameList.length > 0
        ? userTokenOptionList!.filter((u) =>
            autoStakeUsernameList.find((a: any) => a.symbol === u.value.symbol),
          )
        : [];
    setAutoStakeTokenList(autoStakeUsernameOptionItemList);
  };

  const init = async () => {
    const values = await AutomatedTasksUtils.getClaims(activeAccount.name!);
    setClaimRewards(values[LocalStorageKeyEnum.CLAIM_REWARDS] ?? false);
    setClaimAccounts(values[LocalStorageKeyEnum.CLAIM_ACCOUNTS] ?? false);
    setClaimSavings(values[LocalStorageKeyEnum.CLAIM_SAVINGS] ?? false);
    setEnabledAutoStake(
      await AutomatedTasksUtils.getUsernameAutoStake(activeAccount.name!),
    );
  };

  const handleItemClicked = (accountName: string) => {
    const itemClicked = accounts.find(
      (account: LocalAccount) => account.name === accountName,
    );
    loadActiveAccount(itemClicked!);
  };

  const handleSetSelectedToken = async (selected: OptionItem) => {
    setSelectedUserTokenOption(DEFAULT_SELECTED_TOKEN_OPTION);
    if (
      !autoStakeTokenList?.find((a) => a.value.symbol === selected.value.symbol)
    ) {
      const copyAutoStakeList = [...autoStakeTokenList];
      copyAutoStakeList.unshift(selected);
      await setAndSaveAutoStakeTokenList(copyAutoStakeList);
    }
  };

  const setAndSaveAutoStakeTokenList = async (autoStakeData: OptionItem[]) => {
    setAutoStakeTokenList(autoStakeData);
    await AutomatedTasksUtils.updateAutoStakeTokenList(
      activeAccount.name!,
      autoStakeData,
    );
  };

  const handleRemoveItem = async (item: OptionItem) => {
    if (autoStakeTokenList.find((a) => a.value.symbol === item.value.symbol)) {
      const copyAutoStakeList = [...autoStakeTokenList].filter(
        (i) => i.value.symbol !== item.value.symbol,
      );
      await setAndSaveAutoStakeTokenList(copyAutoStakeList);
    }
  };

  const handleSetAutoStake = async (enable: boolean) => {
    setEnabledAutoStake(enable);
    await AutomatedTasksUtils.saveUsernameAutoStake(
      activeAccount.name!,
      enable,
    );
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
        data-testid={`select-account-item-${selectProps.item.label}`}
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

  const isClaimedAccountDisabled =
    activeAccount.rc.max_rc < Config.claims.freeAccount.MIN_RC * 1.5;
  return (
    <div
      data-testid={`${Screen.SETTINGS_AUTOMATED_TASKS}-page`}
      className="automated-tasks-page">
      <div className="intro">
        {chrome.i18n.getMessage('popup_html_automated_intro')}
      </div>

      <SelectAccountSectionComponent fullSize background="white" />

      <div className="section">
        <div
          className="section-expander"
          onClick={() => setIsHiveSectionExpanded(!isHiveSectionExpanded)}>
          <div className="section-title-logo">
            <div className="section-title">
              {chrome.i18n.getMessage(
                'popup_html_automated_hive_section_title',
              )}
            </div>
          </div>
          <SVGIcon
            className="custom-select-handle"
            icon={
              isHiveSectionExpanded
                ? SVGIcons.SELECT_ARROW_UP
                : SVGIcons.SELECT_ARROW_DOWN
            }
          />
        </div>
        {isHiveSectionExpanded && (
          <div className="tasks">
            <CheckboxPanelComponent
              dataTestId="checkbox-autoclaim-rewards"
              title="popup_html_enable_autoclaim_rewards"
              checked={claimRewards}
              onChange={(value) =>
                saveClaims(value, claimAccounts, claimSavings)
              }
              hint="popup_html_enable_autoclaim_rewards_info"
              tooltipMessage={claimRewardsErrorMessage}
              disabled={!!claimRewardsErrorMessage}
            />
            <CheckboxPanelComponent
              dataTestId="checkbox-autoclaim-accounts"
              title="popup_html_enable_autoclaim_accounts"
              checked={claimAccounts && !isClaimedAccountDisabled}
              onChange={(value) =>
                saveClaims(claimRewards, value, claimSavings)
              }
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
              onChange={(value) =>
                saveClaims(claimRewards, claimAccounts, value)
              }
              hint="popup_html_enable_autoclaim_savings_info"
              tooltipMessage={claimSavingsErrorMessage}
              disabled={!!claimSavingsErrorMessage}
            />
          </div>
        )}
      </div>
      <div className="section">
        <div
          className="section-expander"
          onClick={() =>
            setIsHiveEngineSectionExpanded(!isHiveEngineSectionExpanded)
          }>
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
          <SVGIcon
            className="custom-select-handle"
            icon={
              isHiveEngineSectionExpanded
                ? SVGIcons.SELECT_ARROW_UP
                : SVGIcons.SELECT_ARROW_DOWN
            }
          />
        </div>
        {isHiveEngineSectionExpanded && (
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
                    <CustomSelectItemComponent
                      key={`option-${o.label}`}
                      isLast={true}
                      item={o}
                      isSelected={false}
                      handleItemClicked={() => {}}
                      closeDropdown={() => {}}
                      onDelete={() => handleRemoveItem(o)}
                      canDelete={true}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    accounts: state.hive.accounts,
    activeAccount: state.hive.activeAccount,
    userTokens: state.hive.userTokens,
    market: state.hive.tokenMarket,
    allTokens: state.hive.tokens,
  };
};

const connector = connect(mapStateToProps, {
  loadActiveAccount,
  setTitleContainerProperties,
  loadUserTokens,
  loadTokensMarket,
  loadTokens,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AutomatedTasksComponent = connector(AutomatedTasks);
