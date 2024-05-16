import { Screen } from '@interfaces/screen.interface';
import { getEvmActiveAccount } from '@popup/evm/actions/active-account.actions';
import { EvmSelectAccountSectionComponent } from '@popup/evm/pages/home/evm-select-account-section/evm-select-account-section.component';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { TutorialPopupComponent } from '@popup/hive/pages/app-container/tutorial-popup/tutorial-popup.component';
import { setSuccessMessage } from '@popup/multichain/actions/message.actions';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { resetTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { HomepageContainer } from 'src/common-ui/_containers/homepage-container/homepage-container.component';
import { TopBarComponent } from 'src/common-ui/_containers/top-bar/top-bar.component';
import {
  AccountValueType,
  EstimatedAccountValueSectionComponent,
} from 'src/common-ui/estimated-account-value-section/estimated-account-value-section.component';
import { EvmWalletInfoSectionComponent } from 'src/common-ui/wallet-info-section/wallet-info-section.component';
import { loadCurrencyPrices } from 'src/popup/hive/actions/currency-prices.actions';
import { ActionsSectionComponent } from 'src/popup/hive/pages/app-container/home/actions-section/actions-section.component';
import { ProposalVotingSectionComponent } from 'src/popup/hive/pages/app-container/home/voting-section/proposal-voting-section/proposal-voting-section.component';
import { SurveyComponent } from 'src/popup/hive/pages/app-container/survey/survey.component';
import { Survey } from 'src/popup/hive/pages/app-container/survey/survey.interface';
import { WhatsNewComponent } from 'src/popup/hive/pages/app-container/whats-new/whats-new.component';
import { WhatsNewContent } from 'src/popup/hive/pages/app-container/whats-new/whats-new.interface';
import { SurveyUtils } from 'src/popup/hive/utils/survey.utils';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { VersionLogUtils } from 'src/utils/version-log.utils';
import { WhatsNewUtils } from 'src/utils/whats-new.utils';

const Home = ({
  chain,
  accounts,
  resetTitleContainerProperties,
  activeAccount,
  getEvmActiveAccount,
  navigateTo,
}: PropsFromRedux) => {
  const [displayWhatsNew, setDisplayWhatsNew] = useState(false);
  const [whatsNewContent, setWhatsNewContent] = useState<WhatsNewContent>();
  const [surveyToDisplay, setSurveyToDisplay] = useState<Survey>();

  const [scrollTop, setScrollTop] = useState(0);
  const [showBottomBar, setShowBottomBar] = useState(true);

  useEffect(() => {
    resetTitleContainerProperties();
    initWhatsNew();
    initSurvey();
  }, []);

  useEffect(() => {
    if (chain) refreshAccountBalances();
  }, [chain]);

  //TODO : move survey and whatsnew logic in a hook since its called on both evm and hive
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

  const refreshAccountBalances = async () => {
    getEvmActiveAccount(
      chain,
      accounts[0].wallet.address,
      accounts[0].wallet.signingKey,
    );
  };

  const renderPopup = (
    displayWhatsNew: boolean,
    surveyToDisplay: Survey | undefined,
  ) => {
    if (displayWhatsNew) {
      return (
        <WhatsNewComponent
          onOverlayClick={() => setDisplayWhatsNew(false)}
          content={whatsNewContent!}
        />
      );
    } else if (surveyToDisplay) {
      return <SurveyComponent survey={surveyToDisplay} />;
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

  return (
    <HomepageContainer datatestId={`${Screen.EVM_HOME}-page`}>
      <TopBarComponent
        onMenuButtonClicked={async () => {
          navigateTo(EvmScreen.EVM_SETTINGS);
          return;
        }}
        onRefreshButtonClicked={refreshAccountBalances}
        accountSelector={
          <EvmSelectAccountSectionComponent background="white" />
        }
      />

      <div className={'home-page-content'} onScroll={handleScroll}>
        <EstimatedAccountValueSectionComponent
          accountValues={{
            [AccountValueType.DOLLARS]: `$${FormatUtils.withCommas(
              EvmTokensUtils.getTotalBalanceInUsd(activeAccount.balances),
            )}`,
            [AccountValueType.TOKEN]: `${FormatUtils.withCommas(
              EvmTokensUtils.getTotalBalanceInMainToken(
                activeAccount.balances,
                chain,
              ),
            )} ${chain.mainToken}`,
          }}
        />
        <EvmWalletInfoSectionComponent evmTokens={activeAccount.balances} />
      </div>
      <ActionsSectionComponent
        selectedToken={chain.mainToken}
        additionalClass={showBottomBar ? undefined : 'down'}
      />
      <ProposalVotingSectionComponent />
      {renderPopup(displayWhatsNew, surveyToDisplay)}
      <TutorialPopupComponent />
    </HomepageContainer>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    chain: state.chain as EvmChain,
    accounts: state.evm.accounts,
    activeAccount: state.evm.activeAccount,
  };
};

const connector = connect(mapStateToProps, {
  loadCurrencyPrices,
  resetTitleContainerProperties,
  setSuccessMessage,
  getEvmActiveAccount,
  navigateTo,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmHomeComponent = connector(Home);
