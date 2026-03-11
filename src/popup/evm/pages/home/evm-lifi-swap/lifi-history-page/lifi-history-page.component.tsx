import { RootState } from '@popup/multichain/store';
import Config from 'src/config';

import { SVGIcons } from '@common-ui/icons.enum';
import RotatingLogoComponent from '@common-ui/rotating-logo/rotating-logo.component';
import { SVGIcon } from '@common-ui/svg-icon/svg-icon.component';
import { ExtendedChain } from '@lifi/types';
import { LiFiHistoryItem } from '@popup/evm/pages/home/evm-lifi-swap/lifi-history-page/lifi-history-item/lifi-history-item.component';
import { LiFiUtils } from '@popup/evm/utils/lifi.utils';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { LifiHistoryItem as LiFiHistoryItemType } from 'hive-keychain-commons';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';

const LiFiHistoryPage = ({
  activeAccount,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [history, setHistory] = useState<LiFiHistoryItemType[]>([]);
  const [autoRefreshCountdown, setAutoRefreshCountdown] = useState<
    number | null
  >(null);
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lifiData, setLifiData] = useState<{
    tokens: { [key: string]: string };
    chains: ExtendedChain[];
  }>();

  useEffect(() => {
    setTitleContainerProperties({
      title: 'html_popup_token_swaps_history',
      isBackButtonEnabled: true,
    });
    initSwapHistory();
  }, []);

  useEffect(() => {
    if (autoRefreshCountdown === null) {
      return;
    }

    if (autoRefreshCountdown === 0) {
      refresh();
      setAutoRefreshCountdown(Config.swaps.autoRefreshHistoryPeriodSec);
      return;
    }

    const intervalId = setInterval(() => {
      setAutoRefreshCountdown(autoRefreshCountdown - 1);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [autoRefreshCountdown]);

  const initSwapHistory = async () => {
    setLoading(true);
    try {
      const data = await LiFiUtils.getLifiData();
      setLifiData(data);
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    setShouldRefresh(true);
    try {
      const result = await LiFiUtils.retrieveLiFiHistory(
        activeAccount.wallet.address,
      );
      setHistory(result);
    } finally {
      setAutoRefreshCountdown(Config.swaps.autoRefreshHistoryPeriodSec);
      setShouldRefresh(false);
    }
  };

  if (loading) {
    return (
      <div className="rotating-logo-wrapper">
        <RotatingLogoComponent />
      </div>
    );
  }

  return (
    <div className="lifi-history-page">
      <div className="delay-caption-message">
        {chrome.i18n.getMessage('evm_lifi_swap_delay_caption_message')}
      </div>
      <div className="refresh-panel">
        {!!autoRefreshCountdown && (
          <>
            {chrome.i18n.getMessage('swap_refresh_countdown', [
              autoRefreshCountdown?.toString(),
            ])}
            <SVGIcon
              className={`swap-history-refresh ${shouldRefresh ? 'rotate' : ''}`}
              icon={SVGIcons.SWAPS_HISTORY_REFRESH}
              onClick={refresh}
            />
          </>
        )}
      </div>
      <div className="history">
        {lifiData &&
          history.length > 0 &&
          history.map((item, index) => {
            const sendingChainLogoURI = lifiData.chains.find(
              (chain: any) => chain.id === item.sending?.chainId!,
            )?.logoURI;
            const receivingChainLogoURI = lifiData.chains.find(
              (chain: any) => chain.id === item.receiving?.chainId!,
            )?.logoURI;
            return (
              <LiFiHistoryItem
                key={`lifi-history-${index}`}
                historyItem={item}
                sendingChainLogoURI={sendingChainLogoURI}
                receivingChainLogoURI={receivingChainLogoURI}
              />
            );
          })}
        {history.length === 0 && (
          <div className="empty-history-panel">
            <SVGIcon icon={SVGIcons.MESSAGE_ERROR} />
            <span className="text">
              {chrome.i18n.getMessage('swap_no_history')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  activeAccount: state.evm.activeAccount,
});

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const LiFiHistoryPageComponent = connector(LiFiHistoryPage);
