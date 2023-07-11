import ActiveAccountUtils from '@hiveapp/utils/active-account.utils';
import { RewardsUtils } from '@hiveapp/utils/rewards.utils';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { NewIcons } from 'src/common-ui/icons.enum';
import { SelectAccountSectionComponent } from 'src/common-ui/select-account-section/select-account-section.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { refreshActiveAccount } from 'src/popup/hive/actions/active-account.actions';
import { loadGlobalProperties } from 'src/popup/hive/actions/global-properties.actions';
import {
  addToLoadingList,
  removeFromLoadingList,
} from 'src/popup/hive/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from 'src/popup/hive/actions/message.actions';
import { navigateTo } from 'src/popup/hive/actions/navigation.actions';
import { RootState } from 'src/popup/hive/store';
import { Screen } from 'src/reference-data/screen.enum';
import FormatUtils from 'src/utils/format.utils';
import './top-bar.component.scss';

const TopBar = ({
  navigateTo,
  refreshActiveAccount,
  activeAccount,
  globalProperties,
  addToLoadingList,
  removeFromLoadingList,
  loadGlobalProperties,
  setErrorMessage,
  setSuccessMessage,
}: PropsFromRedux) => {
  const [hasRewardToClaim, setHasRewardToClaim] = useState(false);
  const [rotateLogo, setRotateLogo] = useState(false);

  useEffect(() => {
    if (!ActiveAccountUtils.isEmpty(activeAccount)) {
      setHasRewardToClaim(
        RewardsUtils.hasReward(
          activeAccount.account.reward_hbd_balance as string,
          FormatUtils.toHP(
            activeAccount.account.reward_vesting_balance
              .toString()
              .replace('VESTS', ''),
            globalProperties.globals,
          ).toString(),
          activeAccount.account.reward_hive_balance as string,
        ),
      );
    }
  }, [activeAccount]);

  const refresh = () => {
    setRotateLogo(true);
    refreshActiveAccount();
    loadGlobalProperties();
    setTimeout(() => setRotateLogo(false), 1000);
  };

  const claim = async (): Promise<void> => {
    if (!activeAccount.keys.posting) {
      setErrorMessage('popup_accounts_err_claim');
      return;
    }
    addToLoadingList('popup_html_claiming_rewards');
    try {
      const claimSuccessful = await RewardsUtils.claimRewards(
        activeAccount.name!,
        activeAccount.account.reward_hive_balance,
        activeAccount.account.reward_hbd_balance,
        activeAccount.account.reward_vesting_balance,
        activeAccount.keys.posting!,
      );
      refreshActiveAccount();
      if (claimSuccessful) {
        const rewardHp =
          FormatUtils.withCommas(
            FormatUtils.toHP(
              activeAccount.account.reward_vesting_balance
                .toString()
                .replace('VESTS', ''),
              globalProperties.globals,
            ).toString(),
          ) + ' HP';
        let claimedResources = [
          activeAccount.account.reward_hive_balance,
          activeAccount.account.reward_hbd_balance,
          rewardHp,
        ].filter(
          (resource) => parseFloat(resource.toString().split(' ')[0]) !== 0,
        );
        setSuccessMessage('popup_html_claim_success', [
          claimedResources.join(', '),
        ]);
        refresh();
      } else {
        setErrorMessage('popup_html_claim_error');
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      removeFromLoadingList('popup_html_claiming_rewards');
    }
  };

  return (
    <div className="top-bar">
      <div className="settings-button-container">
        <SVGIcon
          dataTestId="clickable-settings"
          icon={NewIcons.MENU}
          onClick={() => navigateTo(Screen.SETTINGS_MAIN_PAGE)}
          className="button settings-button"
        />
      </div>
      <img
        className={`logo ${rotateLogo ? 'rotate' : ''}`}
        src="/assets/images/logo-keychain-small.svg"
        onClick={refresh}
        data-testid="top-bar-refresh-icon"
      />
      <div className="spacer"></div>
      {hasRewardToClaim && (
        <SVGIcon
          icon={NewIcons.CLAIM_REWARDS}
          dataTestId="reward-claim-icon"
          className="claim-button"
          onClick={() => claim()}
        />
      )}

      <SelectAccountSectionComponent />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    globalProperties: state.globalProperties,
  };
};

const connector = connect(mapStateToProps, {
  navigateTo,
  refreshActiveAccount,
  addToLoadingList,
  removeFromLoadingList,
  loadGlobalProperties,
  setErrorMessage,
  setSuccessMessage,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const TopBarComponent = connector(TopBar);
