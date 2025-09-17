import ButtonComponent from '@common-ui/button/button.component';
import { Screen } from '@interfaces/screen.interface';
import {
  loadEvmActiveAccount,
  loadEvmHistory,
} from '@popup/evm/actions/active-account.actions';
import { fetchPrices } from '@popup/evm/actions/price.actions';
import { EvmErc721Token } from '@popup/evm/interfaces/active-account.interface';
import { EvmUserHistoryItem } from '@popup/evm/interfaces/evm-tokens-history.interface';
import { EvmDappStatusComponent } from '@popup/evm/pages/home/evm-dapp-status/evm-dapp-status.component';
import { EvmSelectAccountSectionComponent } from '@popup/evm/pages/home/evm-select-account-section/evm-select-account-section.component';
import { EvmWalletInfoSectionComponent } from '@popup/evm/pages/home/evm-wallet-info-section/evm-wallet-info-section.component';
import { EvmPrices } from '@popup/evm/reducers/prices.reducer';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import { EvmActiveAccountUtils } from '@popup/evm/utils/evm-active-account.utils';
import { EvmRpcUtils } from '@popup/evm/utils/evm-rpc.utils';
import { EvmTokensHistoryParserUtils } from '@popup/evm/utils/evm-tokens-history-parser.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { EvmTransactionsUtils } from '@popup/evm/utils/evm-transactions.utils';
import { TutorialPopupComponent } from '@popup/hive/pages/app-container/tutorial-popup/tutorial-popup.component';
import { setErrorMessage } from '@popup/multichain/actions/message.actions';
import {
  navigateTo,
  navigateToWithParams,
  NavigationParams,
} from '@popup/multichain/actions/navigation.actions';
import { resetTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import {
  EvmChain,
  MultichainRpc,
} from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { AccountValueType } from '@reference-data/account-value-type.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { HomepageContainer } from 'src/common-ui/_containers/homepage-container/homepage-container.component';
import { TopBarComponent } from 'src/common-ui/_containers/top-bar/top-bar.component';
import { EstimatedAccountValueSectionComponent } from 'src/common-ui/estimated-account-value-section/estimated-account-value-section.component';
import { loadCurrencyPrices } from 'src/popup/hive/actions/currency-prices.actions';
import { ActionsSectionComponent } from 'src/popup/hive/pages/app-container/home/actions-section/actions-section.component';
import { ProposalVotingSectionComponent } from 'src/popup/hive/pages/app-container/home/voting-section/proposal-voting-section/proposal-voting-section.component';
import { SurveyComponent } from 'src/popup/hive/pages/app-container/survey/survey.component';
import { Survey } from 'src/popup/hive/pages/app-container/survey/survey.interface';
import { WhatsNewComponent } from 'src/popup/hive/pages/app-container/whats-new/whats-new.component';
import { WhatsNewContent } from 'src/popup/hive/pages/app-container/whats-new/whats-new.interface';
import { SurveyUtils } from 'src/popup/hive/utils/survey.utils';
import { ArrayUtils } from 'src/utils/array.utils';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { VersionLogUtils } from 'src/utils/version-log.utils';
import { WhatsNewUtils } from 'src/utils/whats-new.utils';

const Home = ({
  chain,
  accounts,
  activeAccount,
  prices,
  navigateTo,
  loadEvmActiveAccount,
  resetTitleContainerProperties,
  fetchPrices,
  navigateToWithParams,
  loadEvmHistory,
  setErrorMessage,
}: PropsFromRedux) => {
  const [displayWhatsNew, setDisplayWhatsNew] = useState(false);
  const [whatsNewContent, setWhatsNewContent] = useState<WhatsNewContent>();
  const [surveyToDisplay, setSurveyToDisplay] = useState<Survey>();

  const [scrollTop, setScrollTop] = useState(0);
  const [showBottomBar, setShowBottomBar] = useState(true);
  const [pendingTransactionsItems, setPendingTransactionsItems] =
    useState<EvmUserHistoryItem[]>();

  // RPC related
  const [displayChangeRpcPopup, setDisplayChangeRpcPopup] = useState(false);
  const [initialRpc, setInitialRpc] = useState<MultichainRpc>();
  const [switchToRpc, setSwitchToRpc] = useState<MultichainRpc>();

  useEffect(() => {
    resetTitleContainerProperties();
    initWhatsNew();
    initSurvey();
    checkActiveRpc();
  }, []);

  useEffect(() => {
    if (activeAccount.wallet.address) {
      ChainUtils.setPreviousChain(chain);
      ChainUtils.addChainToSetupChains(chain);
    }
  }, [activeAccount.address]);

  useEffect(() => {
    if (
      !ArrayUtils.includesAll(
        Object.keys(prices),
        activeAccount.nativeAndErc20Tokens.value.map((b) => b.tokenInfo.symbol),
      )
    ) {
      fetchPrices(
        activeAccount.nativeAndErc20Tokens.value.map((t) => t.tokenInfo),
      );
    }
  }, [activeAccount.nativeAndErc20Tokens]);

  const checkActiveRpc = async () => {
    const rpc = await EvmRpcUtils.getActiveRpc(chain);
    setInitialRpc(rpc);
    const rpcStatusOk = await EvmRpcUtils.checkRpcStatus(rpc.url);

    const switchAuto = await EvmRpcUtils.getSwitchRpcAuto(chain);

    if (!rpcStatusOk) {
      if (switchAuto) {
        const switchResult = await EvmRpcUtils.automaticallySwitchToWorkingRpc(
          chain,
        );
        if (!switchResult) {
          setErrorMessage('evm_rpcs_not_responding_error');
        } else {
          refresh();
        }
      } else {
        const rpcToSwitch = await EvmRpcUtils.switchToWorkingRpc(chain);
        if (rpcToSwitch) {
          setDisplayChangeRpcPopup(true);
          setSwitchToRpc(rpcToSwitch);
        } else {
          setErrorMessage('evm_rpcs_not_responding_error');
        }
      }
    }
  };

  const switchRpc = async () => {
    await EvmRpcUtils.setActiveRpc(switchToRpc!, chain);
    setDisplayChangeRpcPopup(false);
    refresh();
  };

  const loadActiveAccount = async () => {
    if (chain) {
      const wallet = await EvmActiveAccountUtils.getSavedActiveAccountWallet(
        chain,
        accounts,
      );
      loadEvmActiveAccount(chain, wallet);
      getPendingTransactions();
    }
  };

  const getPendingTransactions = async () => {
    const pendingTransactions =
      await EvmTransactionsUtils.getPendingTransactionsForWallet(
        activeAccount.address,
        chain.chainId,
      );

    const pendingTxItems = [];
    const tokensMetadata = await EvmTokensUtils.getMetadataFromStorage(chain);
    for (const pendingTx of pendingTransactions) {
      const item = await EvmTokensHistoryParserUtils.parseEvent(
        {
          ...pendingTx.txResponseParams,
          input: pendingTx.txResponseParams.data,
        },
        chain,
        pendingTx.walletAddress.toLowerCase(),
        tokensMetadata,
      );
      if (item) {
        item.isPending = true;
        pendingTxItems.push(item);
      }
    }
    setPendingTransactionsItems(pendingTxItems);
  };

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

  const refresh = async () => {
    loadActiveAccount();
  };

  const renderPopup = (
    displayWhatsNew: boolean,
    surveyToDisplay: Survey | undefined,
    displayChangeRpcPopup: boolean,
  ) => {
    if (displayWhatsNew) {
      return (
        <WhatsNewComponent
          onOverlayClick={() => setDisplayWhatsNew(false)}
          content={whatsNewContent!}
        />
      );
    } else if (displayChangeRpcPopup) {
      return (
        <div className="change-rpc-popup">
          <div className="message">
            {chrome.i18n.getMessage('popup_html_rpc_not_responding_error', [
              initialRpc?.url!,
              switchToRpc?.url!,
            ])}
          </div>
          <ButtonComponent
            label="popup_html_switch_rpc"
            onClick={switchRpc}></ButtonComponent>
        </div>
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

  const handleClickOnNftCollection = (
    params: EvmErc721Token | EvmErc721Token[],
    screen: EvmScreen,
  ) => {
    switch (screen) {
      case EvmScreen.EVM_NFT_COLLECTION_PAGE: {
        navigateToWithParams(EvmScreen.EVM_NFT_COLLECTION_PAGE, {
          collection: params,
        } as NavigationParams);
        break;
      }
      case EvmScreen.EVM_NFT_ALL_NFTS_PAGE: {
        navigateToWithParams(EvmScreen.EVM_NFT_ALL_NFTS_PAGE, {
          collections: params,
        } as NavigationParams);
        break;
      }
    }
  };

  return (
    <HomepageContainer datatestId={`${Screen.HOME_PAGE}-page`}>
      <TopBarComponent
        onMenuButtonClicked={async () => {
          navigateTo(EvmScreen.EVM_SETTINGS);
          return;
        }}
        onRefreshButtonClicked={refresh}
        accountSelector={
          <EvmSelectAccountSectionComponent
            background="white"
            removeBorder
            isOnMain
          />
        }
      />

      <div className={'home-page-content'} onScroll={handleScroll}>
        <div className="evm-account-value-wrapper">
          <EstimatedAccountValueSectionComponent
            accountValues={{
              [AccountValueType.DOLLARS]: `$${FormatUtils.withCommas(
                EvmTokensUtils.getTotalBalanceInUsd(
                  activeAccount.nativeAndErc20Tokens.value,
                  prices,
                ),
              )}`,
              [AccountValueType.TOKEN]: `${FormatUtils.withCommas(
                EvmTokensUtils.getTotalBalanceInMainToken(
                  activeAccount.nativeAndErc20Tokens.value,
                  chain,
                  prices,
                ),
              )} ${chain.mainToken}`,
            }}
          />

          <EvmDappStatusComponent />
        </div>
        <EvmWalletInfoSectionComponent
          activeAccount={activeAccount}
          prices={prices}
          onClickOnNftPreview={handleClickOnNftCollection}
          chain={chain}
          loadEvmHistory={loadEvmHistory}
          pendingTransactionsItems={pendingTransactionsItems}
        />
      </div>
      <ActionsSectionComponent
        additionalClass={showBottomBar ? undefined : 'down'}
      />
      <ProposalVotingSectionComponent />
      {renderPopup(displayWhatsNew, surveyToDisplay, displayChangeRpcPopup)}
      <TutorialPopupComponent />
    </HomepageContainer>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    chain: state.chain as EvmChain,
    accounts: state.evm.accounts,
    activeAccount: state.evm.activeAccount,
    prices: state.evm.prices as EvmPrices,
  };
};

const connector = connect(mapStateToProps, {
  loadCurrencyPrices,
  resetTitleContainerProperties,
  setErrorMessage,
  loadEvmActiveAccount,
  navigateTo,
  fetchPrices,
  navigateToWithParams,
  loadEvmHistory,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmHomeComponent = connector(Home);
