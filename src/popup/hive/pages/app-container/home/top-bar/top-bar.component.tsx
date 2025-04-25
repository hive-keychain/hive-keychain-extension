import {
  TransactionOptions,
  TransactionOptionsMetadata,
} from '@interfaces/keys.interface';
import { loadUserTokens } from '@popup/hive/actions/token.actions';
import { NotificationsComponent } from '@popup/hive/pages/app-container/home/notifications/notifications.component';
import { MultisigUtils } from '@popup/hive/utils/multisig.utils';
import {
  addCaptionToLoading,
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/multichain/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/multichain/actions/message.actions';
import { closeModal, openModal } from '@popup/multichain/actions/modal.actions';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { RootState } from '@popup/multichain/store';
import { FormatUtils, KeychainKeyTypes } from 'hive-keychain-commons';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { MetadataPopup } from 'src/common-ui/metadata-popup/metadata-popup.component';
import { SelectAccountSectionComponent } from 'src/common-ui/select-account-section/select-account-section.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { refreshActiveAccount } from 'src/popup/hive/actions/active-account.actions';
import { loadGlobalProperties } from 'src/popup/hive/actions/global-properties.actions';
import ActiveAccountUtils from 'src/popup/hive/utils/active-account.utils';
import { RewardsUtils } from 'src/popup/hive/utils/rewards.utils';
import { Screen } from 'src/reference-data/screen.enum';
import { AsyncUtils } from 'src/utils/async.utils';

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
  addCaptionToLoading,
  openModal,
  closeModal,
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
    loadUserTokens(activeAccount.name!);
    setTimeout(() => setRotateLogo(false), 1000);
  };

  const claim = async (options?: TransactionOptions) => {
    try {
      addToLoadingList('popup_html_claiming_rewards');
      const claimResult = await RewardsUtils.claimRewards(
        activeAccount.name!,
        activeAccount.account.reward_hive_balance,
        activeAccount.account.reward_hbd_balance,
        activeAccount.account.reward_vesting_balance,
        activeAccount.keys.posting!,
        options,
      );
      await AsyncUtils.sleep(3000);
      refreshActiveAccount();
      if (claimResult) {
        if (claimResult.isUsingMultisig) {
          setSuccessMessage('multisig_transaction_sent_to_signers');
        } else {
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
        }
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

  const handleClickOnClaim = async (): Promise<void> => {
    if (!activeAccount.keys.posting) {
      setErrorMessage('popup_accounts_err_claim');
      return;
    } else {
      const twoFaAccounts = await MultisigUtils.get2FAAccounts(
        activeAccount.account,
        KeychainKeyTypes.active,
      );

      let initialMetadata = {} as TransactionOptionsMetadata;
      for (const account of twoFaAccounts) {
        if (!initialMetadata.twoFACodes) initialMetadata.twoFACodes = {};
        initialMetadata.twoFACodes[account] = '';
      }

      if (twoFaAccounts.length > 0) {
        openModal({
          title: 'popup_html_transaction_metadata',
          children: (
            <MetadataPopup
              initialMetadata={initialMetadata}
              onSubmit={(metadata: TransactionOptionsMetadata) => {
                addCaptionToLoading('multisig_transmitting_to_2fa');
                claim({ metaData: metadata });
                closeModal();
              }}
              onCancel={() => closeModal()}
            />
          ),
        });
      } else {
        claim();
      }
    }
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
      />
      <div className="spacer"></div>
      {activeAccount.name && globalProperties.globals && (
        <NotificationsComponent />
      )}
      {hasRewardToClaim && (
        <SVGIcon
          icon={SVGIcons.TOP_BAR_CLAIM_REWARDS_BTN}
          dataTestId="reward-claim-icon"
          className="claim-button"
          onClick={() => handleClickOnClaim()}
          hoverable
        />
      )}
      <SelectAccountSectionComponent isOnMain />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.hive.activeAccount,
    globalProperties: state.hive.globalProperties,
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
  addCaptionToLoading,
  openModal,
  closeModal,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const TopBarComponent = connector(TopBar);
