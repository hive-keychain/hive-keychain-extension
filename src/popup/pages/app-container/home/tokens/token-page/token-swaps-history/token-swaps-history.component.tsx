import { Swap } from '@interfaces/swap-token.interface';
import { setInfoMessage } from '@popup/actions/message.actions';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { Icons } from '@popup/icons.enum';
import { TokenSwapsHistoryItemComponent } from '@popup/pages/app-container/home/tokens/token-page/token-swaps-history/token-swaps-history-item/token-swaps-history-item.component';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import Icon from 'src/common-ui/icon/icon.component';
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
    await refresh();
  };

  const refresh = async () => {
    setLoading(true);
    const result = await SwapTokenUtils.retrieveSwapHistory(
      activeAccount.name!,
    );
    setHistory(result);
    setAutoRefreshCountdown(Config.swaps.autoRefreshEveryXSec);
    setLoading(false);
  };

  return (
    <div className="token-swaps-history">
      <div className="refresh-panel">
        {!!autoRefreshCountdown && (
          <>
            {chrome.i18n.getMessage('swap_refresh_countdown', [
              autoRefreshCountdown?.toString(),
            ])}
            <Icon name={Icons.REFRESH} onClick={refresh} rotate={loading} />
          </>
        )}
        {autoRefreshCountdown && <span></span>}
      </div>
      {history.length > 0 &&
        history.map((item, index) => {
          return (
            <TokenSwapsHistoryItemComponent key={`item-${index}`} swap={item} />
          );
        })}
      {history.length === 0 && (
        <div className="empty-history-panel">
          <Icon name={Icons.INBOX} />
          <span>{chrome.i18n.getMessage('swap_no_history')}</span>
        </div>
      )}
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
