import { DynamicGlobalProperties } from '@hiveio/dhive';
import { sleep } from '@hiveio/dhive/lib/utils';
import { Notification } from '@interfaces/notifications.interface';
import { loadUserTokens } from '@popup/hive/actions/token.actions';
import { NotificationPanelComponent } from '@popup/hive/pages/app-container/home/top-bar/notification-panel.component';
import { NotificationsUtils } from '@popup/hive/utils/notifications/notifications.utils';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
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
import ActiveAccountUtils from 'src/popup/hive/utils/active-account.utils';
import { RewardsUtils } from 'src/popup/hive/utils/rewards.utils';
import { Screen } from 'src/reference-data/screen.enum';
import FormatUtils from 'src/utils/format.utils';

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
  loadUserTokens,
}: PropsFromRedux) => {
  const [hasRewardToClaim, setHasRewardToClaim] = useState(false);
  const [rotateLogo, setRotateLogo] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>();
  const [isNotificationPanelOpen, setNotificationPanelOpen] = useState(false);

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

  useEffect(() => {
    if (globalProperties.globals && activeAccount.name)
      initNotifications(activeAccount.name!, globalProperties.globals);
  }, [activeAccount.name, globalProperties]);

  const refresh = () => {
    setRotateLogo(true);
    refreshActiveAccount();
    loadGlobalProperties();
    loadUserTokens(activeAccount.name!);
    setTimeout(() => setRotateLogo(false), 1000);
  };

  const initNotifications = async (
    username: string,
    dynamicGlobalProperties: DynamicGlobalProperties,
  ) => {
    const notifs = await NotificationsUtils.getNotifications(
      username,
      dynamicGlobalProperties,
    );
    console.log(notifs);
    setNotifications(notifs);
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
      await sleep(3000);
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

  const toggleNotificationPanel = () => {
    setNotificationPanelOpen(!isNotificationPanelOpen);
  };

  return (
    <div className="top-bar">
      <SVGIcon
        dataTestId="clickable-settings"
        icon={SVGIcons.MENU_BUTTON}
        onClick={() => navigateTo(Screen.SETTINGS_MAIN_PAGE)}
        className="button settings-button"
      />
      <SVGIcon
        className={`logo ${rotateLogo ? 'rotate' : ''}`}
        icon={SVGIcons.TOP_BAR_KEYCHAIN_LOGO}
        onClick={refresh}
        data-testid="top-bar-refresh-icon"
        tooltipDelayShow={1500}
        tooltipMessage="html_popup_click_to_refresh"
        tooltipPosition="right"
      />
      <div className="spacer"></div>
      {notifications && notifications.length > 0 && (
        <SVGIcon
          icon={SVGIcons.TOP_BAR_NOTIFICATION_BUTTON}
          dataTestId="notification-button"
          className="notification-button"
          onClick={() => toggleNotificationPanel()}
          hoverable
        />
      )}
      {hasRewardToClaim && (
        <SVGIcon
          icon={SVGIcons.TOP_BAR_CLAIM_REWARDS_BTN}
          dataTestId="reward-claim-icon"
          className="claim-button"
          onClick={() => claim()}
          hoverable
        />
      )}

      <SelectAccountSectionComponent isOnMain />
      {notifications && notifications.length > 0 && (
        <NotificationPanelComponent
          notifications={notifications}
          isPanelOpened={isNotificationPanelOpen}
          onSetAllAsRead={() => setNotifications([])}
        />
      )}
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
  loadUserTokens,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const TopBarComponent = connector(TopBar);
