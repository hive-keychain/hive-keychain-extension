import { sleep } from '@hiveio/dhive/lib/utils';
import { AccountVestingRoutesDifferences } from '@interfaces/vesting-routes.interface';
import { loadGlobalProperties } from '@popup/hive/actions/global-properties.actions';
import { loadUserTokens } from '@popup/hive/actions/token.actions';
import { NotificationsComponent } from '@popup/hive/pages/app-container/home/notifications/notifications.component';
import { SelectAccountSectionComponent } from '@popup/hive/pages/app-container/select-account-section/select-account-section.component';
import { TutorialPopupComponent } from '@popup/hive/pages/app-container/tutorial-popup/tutorial-popup.component';
import { VestingRoutesPopupComponent } from '@popup/hive/pages/app-container/vesting-routes-popup/vesting-routes-popup.component';
import { RewardsUtils } from '@popup/hive/utils/rewards.utils';
import { VestingRoutesUtils } from '@popup/hive/utils/vesting-routes.utils';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/multichain/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/multichain/actions/message.actions';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { resetTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { HomepageContainer } from 'src/common-ui/_containers/homepage-container/homepage-container.component';
import { TopBarComponent } from 'src/common-ui/_containers/top-bar/top-bar.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import { refreshActiveAccount } from 'src/popup/hive/actions/active-account.actions';
import { loadCurrencyPrices } from 'src/popup/hive/actions/currency-prices.actions';
import { ActionsSectionComponent } from 'src/popup/hive/pages/app-container/home/actions-section/actions-section.component';
import { EstimatedAccountValueSectionComponent } from 'src/popup/hive/pages/app-container/home/estimated-account-value-section/estimated-account-value-section.component';
import { GovernanceRenewalComponent } from 'src/popup/hive/pages/app-container/home/governance-renewal/governance-renewal.component';
import { ResourcesSectionComponent } from 'src/popup/hive/pages/app-container/home/resources-section/resources-section.component';
import { ProposalVotingSectionComponent } from 'src/popup/hive/pages/app-container/home/voting-section/proposal-voting-section/proposal-voting-section.component';
import { WalletInfoSectionComponent } from 'src/popup/hive/pages/app-container/home/wallet-info-section/wallet-info-section.component';
import { SurveyComponent } from 'src/popup/hive/pages/app-container/survey/survey.component';
import { Survey } from 'src/popup/hive/pages/app-container/survey/survey.interface';
import { WhatsNewComponent } from 'src/popup/hive/pages/app-container/whats-new/whats-new.component';
import { WhatsNewContent } from 'src/popup/hive/pages/app-container/whats-new/whats-new.interface';
import {
  WrongKeyPopupComponent,
  WrongKeysOnUser,
} from 'src/popup/hive/pages/app-container/wrong-key-popup/wrong-key-popup.component';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import ActiveAccountUtils from 'src/popup/hive/utils/active-account.utils';
import { GovernanceUtils } from 'src/popup/hive/utils/governance.utils';
import { KeysUtils } from 'src/popup/hive/utils/keys.utils';
import { SurveyUtils } from 'src/popup/hive/utils/survey.utils';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
import { VersionLogUtils } from 'src/utils/version-log.utils';
import { WhatsNewUtils } from 'src/utils/whats-new.utils';

const Home = ({
  activeAccount,
  accounts,
  activeRpc,
  globalProperties,
  refreshActiveAccount,
  resetTitleContainerProperties,
  setSuccessMessage,
  navigateTo,
  loadGlobalProperties,
  loadUserTokens,
  removeFromLoadingList,
  setErrorMessage,
}: PropsFromRedux) => {
  const [hasRewardToClaim, setHasRewardToClaim] = useState(false);

  const [displayWhatsNew, setDisplayWhatsNew] = useState(false);
  const [governanceAccountsToExpire, setGovernanceAccountsToExpire] = useState<
    string[]
  >([]);
  const [whatsNewContent, setWhatsNewContent] = useState<WhatsNewContent>();
  const [surveyToDisplay, setSurveyToDisplay] = useState<Survey>();
  const [displayWrongKeyPopup, setDisplayWrongKeyPopup] = useState<
    WrongKeysOnUser | undefined
  >();
  const [vestingRoutesDifferences, setVestingRoutesDifferences] = useState<
    AccountVestingRoutesDifferences[] | undefined
  >();
  const [scrollTop, setScrollTop] = useState(0);
  const [showBottomBar, setShowBottomBar] = useState(true);

  useEffect(() => {
    resetTitleContainerProperties();
    if (!ActiveAccountUtils.isEmpty(activeAccount)) {
      refreshActiveAccount();
    }
    initWhatsNew();
    initSurvey();
    initCheckKeysOnAccounts(accounts);
    initCheckVestingRoutes();
  }, []);

  useEffect(() => {
    if (activeRpc && activeRpc.uri !== 'NULL')
      initGovernanceExpirationReminder(
        accounts
          .filter((localAccount: LocalAccount) => localAccount.keys.active)
          .map((localAccount: LocalAccount) => localAccount.name),
      );
  }, [activeRpc]);

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

  const initGovernanceExpirationReminder = async (accountNames: string[]) => {
    const accountsToRemind = await GovernanceUtils.getGovernanceReminderList(
      accountNames,
    );
    setGovernanceAccountsToExpire(accountsToRemind);
  };

  const initSurvey = async () => {
    setSurveyToDisplay(await SurveyUtils.getSurvey());
  };

  const initWhatsNew = async () => {
    const lastVersionSeen = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.LAST_VERSION_UPDATE,
    );

    if (!lastVersionSeen) {
      WhatsNewUtils.saveLastSeen();
      return;
    }

    const versionLog = await VersionLogUtils.getLastVersion();
    const extensionVersion = chrome.runtime
      .getManifest()
      .version.split('.')
      .splice(0, 2)
      .join('.');

    if (
      extensionVersion !== lastVersionSeen &&
      versionLog?.version === extensionVersion
    ) {
      setWhatsNewContent(versionLog);
      setDisplayWhatsNew(true);
    }
  };

  const initCheckKeysOnAccounts = async (localAccounts: LocalAccount[]) => {
    const extendedAccountsList = await AccountUtils.getExtendedAccounts(
      localAccounts.map((acc) => acc.name!),
    );
    let foundWrongKey: WrongKeysOnUser;
    try {
      let noKeyCheck: WrongKeysOnUser =
        await LocalStorageUtils.getValueFromLocalStorage(
          LocalStorageKeyEnum.NO_KEY_CHECK,
        );
      if (!noKeyCheck) noKeyCheck = { [localAccounts[0].name!]: [] };

      for (let i = 0; i < extendedAccountsList.length; i++) {
        const accountName = localAccounts[i].name!;
        const keys = localAccounts[i].keys;
        foundWrongKey = { [accountName]: [] };
        if (!noKeyCheck.hasOwnProperty(accountName)) {
          noKeyCheck = { ...noKeyCheck, [accountName]: [] };
        }
        for (const [key, value] of Object.entries(keys)) {
          if (!value.length) continue;
          foundWrongKey = KeysUtils.checkWrongKeyOnAccount(
            key,
            value,
            accountName,
            extendedAccountsList[i],
            foundWrongKey,
            !!noKeyCheck[accountName].find(
              (keyName: string) => keyName === key.split('Pubkey')[0],
            ),
          );
        }
        if (foundWrongKey[accountName].length > 0) {
          //change here to force test
          setDisplayWrongKeyPopup(foundWrongKey);
          break;
        }
      }
    } catch (error) {
      Logger.error(error);
    }
  };

  const initCheckVestingRoutes = async () => {
    setVestingRoutesDifferences(
      await VestingRoutesUtils.getWrongVestingRoutes(accounts),
    );
  };

  const renderPopup = (
    displayWhatsNew: boolean,
    governanceAccountsToExpire: string[],
    surveyToDisplay: Survey | undefined,
    displayWrongKeyPopup: WrongKeysOnUser | undefined,
    vestingRoutesDifferences: AccountVestingRoutesDifferences[] | undefined,
  ) => {
    if (displayWhatsNew) {
      return (
        <WhatsNewComponent
          onOverlayClick={() => setDisplayWhatsNew(false)}
          content={whatsNewContent!}
        />
      );
    } else if (governanceAccountsToExpire.length > 0) {
      return (
        <GovernanceRenewalComponent accountNames={governanceAccountsToExpire} />
      );
    } else if (surveyToDisplay) {
      return <SurveyComponent survey={surveyToDisplay} />;
    } else if (displayWrongKeyPopup) {
      return (
        <WrongKeyPopupComponent
          displayWrongKeyPopup={displayWrongKeyPopup}
          setDisplayWrongKeyPopup={setDisplayWrongKeyPopup}
        />
      );
    } else if (
      vestingRoutesDifferences &&
      vestingRoutesDifferences.length > 0
    ) {
      return (
        <VestingRoutesPopupComponent
          vestingRoutesDifferences={vestingRoutesDifferences}
          closePopup={() => setVestingRoutesDifferences(undefined)}
        />
      );
    }
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const scrolled = event.currentTarget.scrollTop;
    if (scrolled > scrollTop) {
      setShowBottomBar(false);
    } else {
      setShowBottomBar(true);
    }
    setScrollTop(scrolled);

    if (
      event.currentTarget.clientHeight + event.currentTarget.scrollTop + 1 >
      event.currentTarget.scrollHeight
    ) {
      setShowBottomBar(true);
    }
  };

  const refresh = async () => {
    refreshActiveAccount();
    loadGlobalProperties();
    loadUserTokens(activeAccount.name!);
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
        if (claimSuccessful.isUsingMultisig) {
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

  return (
    <HomepageContainer datatestId={`${Screen.HOME_PAGE}-page`}>
      {activeAccount &&
        activeAccount.name &&
        activeRpc &&
        activeRpc.uri !== 'NULL' && (
          <>
            <TopBarComponent
              onMenuButtonClicked={async () => {
                navigateTo(Screen.SETTINGS_MAIN_PAGE);
                return;
              }}
              onRefreshButtonClicked={refresh}
              actions={
                <>
                  {hasRewardToClaim && (
                    <SVGIcon
                      icon={SVGIcons.TOP_BAR_CLAIM_REWARDS_BTN}
                      dataTestId="reward-claim-icon"
                      className="claim-button"
                      onClick={() => claim()}
                      hoverable
                    />
                  )}
                  {activeAccount.name && globalProperties.globals && (
                    <NotificationsComponent />
                  )}
                </>
              }
              accountSelector={
                <SelectAccountSectionComponent isOnMain background="white" />
              }
            />

            <div className={'home-page-content'} onScroll={handleScroll}>
              <ResourcesSectionComponent />
              <EstimatedAccountValueSectionComponent />
              <WalletInfoSectionComponent />
            </div>
            <ActionsSectionComponent
              additionalClass={showBottomBar ? undefined : 'down'}
            />
            <ProposalVotingSectionComponent />
          </>
        )}

      {renderPopup(
        displayWhatsNew,
        governanceAccountsToExpire,
        surveyToDisplay,
        displayWrongKeyPopup,
        vestingRoutesDifferences,
      )}
      <TutorialPopupComponent />
    </HomepageContainer>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.hive.activeAccount,
    accounts: state.hive.accounts,
    activeRpc: state.hive.activeRpc,
    globalProperties: state.hive.globalProperties,
  };
};

const connector = connect(mapStateToProps, {
  loadCurrencyPrices,
  refreshActiveAccount,
  resetTitleContainerProperties,
  setSuccessMessage,
  navigateTo,
  loadGlobalProperties,
  loadUserTokens,
  setErrorMessage,
  removeFromLoadingList,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const HiveHomeComponent = connector(Home);
