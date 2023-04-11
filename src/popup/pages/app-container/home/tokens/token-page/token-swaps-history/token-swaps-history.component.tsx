import { Swap, SwapStatus } from '@interfaces/swap-token.interface';
import { setInfoMessage } from '@popup/actions/message.actions';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import Config from 'src/config';
import { SwapTokenUtils } from 'src/utils/swap-token.utils';
import './token-swaps-history.component.scss';

const TokenSwapsHistory = ({
  activeAccount,
  setTitleContainerProperties,
  setInfoMessage,
}: PropsFromRedux) => {
  const [history, setHistory] = useState<Swap[]>([]);
  const [autoRefreshCountdown, setAutoRefreshCountdown] = useState<
    number | null
  >(null);
  const [loading, setLoading] = useState(false);

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
      initSwapHistory();
      setAutoRefreshCountdown(Config.swaps.autoRefreshEveryXSec);
      return;
    }

    const intervalId = setInterval(() => {
      setAutoRefreshCountdown(autoRefreshCountdown! - 1);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [autoRefreshCountdown]);

  const initSwapHistory = async () => {
    setLoading(true);
    const result = await SwapTokenUtils.retrieveSwapHistory(
      activeAccount.name!,
    );
    console.log(result);
    setHistory(result);
    setAutoRefreshCountdown(Config.swaps.autoRefreshEveryXSec);
    setLoading(false);
  };

  const copyIdToCliplboard = (id: string) => {
    navigator.clipboard.writeText(id.toString());
    setInfoMessage('swap_copied_to_clipboard');
  };

  const getStatusMessage = (status: Swap['status']) => {
    switch (status) {
      case SwapStatus.PENDING:
        return chrome.i18n.getMessage('swap_status_pending');
      case SwapStatus.CANCELED:
        return chrome.i18n.getMessage('swap_status_canceled');
      case SwapStatus.FINISHED:
        return chrome.i18n.getMessage('swap_status_finished');
      case SwapStatus.STARTED:
        return chrome.i18n.getMessage('swap_status_started');
    }
  };

  const getShortenedId = (id: string) => {
    return id.substring(0, 6) + '...' + id.slice(-6);
  };

  return (
    <div className="token-swaps-history">
      <div className="refresh-panel">
        {autoRefreshCountdown && (
          <span>
            {chrome.i18n.getMessage('swap_refresh_countdown', [
              autoRefreshCountdown?.toString(),
            ])}
          </span>
        )}
      </div>
      {history.map((item, index) => {
        return (
          <div key={`item-${index}`} className={`history-item`}>
            <div className="top-row">
              <div className="id" onClick={() => copyIdToCliplboard(item.id)}>
                {getShortenedId(item.id)}
              </div>
              <div className={`chip ${item.status}`}>
                {getStatusMessage(item.status)}
              </div>
            </div>
            <div className="swap-details">
              <div className="from-to">
                {item.amount} {item.startToken} {'=>'}{' '}
                {item.estimatedFinalAmount} {item.endToken}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { activeAccount: state.activeAccount };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  setInfoMessage,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const TokenSwapsHistoryComponent = connector(TokenSwapsHistory);
