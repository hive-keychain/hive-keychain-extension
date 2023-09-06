import { setInfoMessage } from '@popup/hive/actions/message.actions';
import { setTitleContainerProperties } from '@popup/hive/actions/title-container.actions';
import { TokenSwapsHistoryItemComponent } from '@popup/hive/pages/app-container/home/swaps/token-swaps-history/token-swaps-history-item/token-swaps-history-item.component';
import { RootState } from '@popup/hive/store';
import { ISwap } from 'hive-keychain-commons';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import Icon from 'src/common-ui/icon/icon.component';
import { NewIcons } from 'src/common-ui/icons.enum';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import Config from 'src/config';
import { SwapTokenUtils } from 'src/utils/swap-token.utils';
import './token-swaps-history.component.scss';

const TokenSwapsHistory = ({
  activeAccount,
  setTitleContainerProperties,
  setInfoMessage,
}: PropsFromRedux) => {
  const [history, setHistory] = useState<ISwap[]>([]);
  const [autoRefreshCountdown, setAutoRefreshCountdown] = useState<
    number | null
  >(null);
  const [shouldRefresh, setRefresh] = useState(false);
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
      refresh();
      setAutoRefreshCountdown(Config.swaps.autoRefreshHistoryPeriodSec);
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
    await refresh();
    setLoading(false);
  };

  const refresh = async () => {
    setRefresh(true);
    const result = await SwapTokenUtils.retrieveSwapHistory(
      activeAccount.name!,
    );
    setHistory(result);
    setAutoRefreshCountdown(Config.swaps.autoRefreshHistoryPeriodSec);
    setRefresh(false);
  };

  if (loading)
    return (
      <div className="rotating-logo-wrapper">
        <RotatingLogoComponent />
      </div>
    );

  return (
    <div className="token-swaps-history">
      <div className="refresh-panel">
        {!!autoRefreshCountdown && (
          <>
            {chrome.i18n.getMessage('swap_refresh_countdown', [
              autoRefreshCountdown?.toString(),
            ])}
            <Icon
              name={NewIcons.CLOSE}
              onClick={refresh}
              rotate={shouldRefresh}
            />
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
          <Icon name={NewIcons.CLOSE} />
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
