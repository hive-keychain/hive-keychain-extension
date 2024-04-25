import { getEvmActiveAccount } from '@popup/evm/actions/active-account.actions';
import { EvmSelectAccountSectionComponent } from '@popup/evm/pages/home/select-account-section/select-account-section.component';
import { MoralisUtils } from '@popup/evm/utils/moralis.utils';
import { setSuccessMessage } from '@popup/multichain/actions/message.actions';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { resetTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { HomepageContainer } from 'src/common-ui/_containers/homepage-container/homepage-container.component';
import { TopBarComponent } from 'src/common-ui/_containers/top-bar/top-bar.component';
import {
  AccountValueType,
  EstimatedAccountValueSectionComponent2,
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
  accounts,
  resetTitleContainerProperties,
  activeAccount,
  getEvmActiveAccount,
}: PropsFromRedux) => {
  const [displayWhatsNew, setDisplayWhatsNew] = useState(false);
  const [whatsNewContent, setWhatsNewContent] = useState<WhatsNewContent>();
  const [surveyToDisplay, setSurveyToDisplay] = useState<Survey>();

  const [scrollTop, setScrollTop] = useState(0);
  const [showBottomBar, setShowBottomBar] = useState(false);

  useEffect(() => {
    resetTitleContainerProperties();
    initWhatsNew();
    initSurvey();
    init();
  }, []);

  //TODO : move survey and whatsnew logic in a hook since its called on both evm and hive
  const initSurvey = async () => {
    setSurveyToDisplay(await SurveyUtils.getSurvey());
  };
  const init = async () => {
    await MoralisUtils.initialise();
    // TODO : this should actually be called before mobing to the homepage
    // getEvmActiveAccount('0x1', accounts[0].wallet.address);
    // TODO : remove  hardcoded wallet address
    console.log('accounts', accounts);
    console.log('active account tokens', activeAccount);
    console.log(
      'total value',
      activeAccount.reduce((a, b) => a + b.usdValue, 0),
    );
    getEvmActiveAccount('0x1', '0xB06Ea6E48A317Db352fA161c8140e8e0791EbB58');
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

  const refresh = async () => {
    getEvmActiveAccount('0x1', '0xB06Ea6E48A317Db352fA161c8140e8e0791EbB58');
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
          navigateTo(Screen.SETTINGS_MAIN_PAGE);
          return;
        }}
        onRefreshButtonClicked={refresh}
        accountSelector={<EvmSelectAccountSectionComponent />}
      />
      <div className={'home-page-content'} onScroll={handleScroll}>
        <EstimatedAccountValueSectionComponent2
          accountValues={{
            [AccountValueType.DOLLARS]: `$${FormatUtils.withCommas(
              activeAccount.reduce((a, b) => a + b.usdValue, 0).toString(),
            )}`,
            [AccountValueType.TOKEN]: `${FormatUtils.withCommas(
              (12.0).toString(),
            )} ETH`,
          }}
        />
        <EvmWalletInfoSectionComponent evmTokens={activeAccount} />
      </div>
      <ActionsSectionComponent
        additionalClass={showBottomBar ? undefined : 'down'}
      />
      <ProposalVotingSectionComponent />
      {renderPopup(displayWhatsNew, surveyToDisplay)}
    </HomepageContainer>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    accounts: state.evm.accounts,
    activeAccount: state.evm.activeAccount,
  };
};

const connector = connect(mapStateToProps, {
  loadCurrencyPrices,
  resetTitleContainerProperties,
  setSuccessMessage,
  getEvmActiveAccount,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmHomeComponent = connector(Home);
