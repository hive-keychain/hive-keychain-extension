import { refreshActiveAccount } from '@popup/actions/active-account.actions';
import { loadGlobalProperties } from '@popup/actions/global-properties.actions';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import { forgetMk } from '@popup/actions/mk.actions';
import { navigateTo, resetNav } from '@popup/actions/navigation.actions';
import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import { Screen } from 'src/reference-data/screen.enum';
import ActiveAccountUtils from 'src/utils/active-account.utils';
import FormatUtils from 'src/utils/format.utils';
import { RewardsUtils } from 'src/utils/rewards.utils';
import './top-bar.component.scss';

const TopBar = ({
  forgetMk,
  navigateTo,
  resetNav,
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

  const lockPopup = (): void => {
    resetNav();
    forgetMk();
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
      <img
        className={rotateLogo ? 'rotate' : ''}
        src="/assets/images/keychain_icon_small.png"
        onClick={refresh}
        aria-label="top-bar-refresh-icon"
      />
      <div className="spacer"></div>

      {hasRewardToClaim && (
        <Icon
          ariaLabel="reward-claim-icon"
          name={Icons.CLAIM}
          onClick={() => claim()}
          additionalClassName="button claim-button"
          type={IconType.STROKED}></Icon>
      )}
      <Icon
        ariaLabel="log-out-button"
        name={Icons.LOGOUT}
        onClick={() => lockPopup()}
        additionalClassName="button lock-button"
        type={IconType.STROKED}></Icon>
      <Icon
        ariaLabel="clickable-settings"
        name={Icons.MENU}
        onClick={() => navigateTo(Screen.SETTINGS_MAIN_PAGE)}
        additionalClassName="button settings-button"
        type={IconType.STROKED}></Icon>
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
  forgetMk,
  navigateTo,
  resetNav,
  refreshActiveAccount,
  addToLoadingList,
  removeFromLoadingList,
  loadGlobalProperties,
  setErrorMessage,
  setSuccessMessage,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const TopBarComponent = connector(TopBar);
