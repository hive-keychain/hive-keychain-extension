import { EVMToken } from '@popup/evm/interfaces/active-account.interface';
import { EvmTokenHistory } from '@popup/evm/interfaces/evm-tokens-history.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmTokenHistoryItemComponent } from '@popup/evm/pages/home/token-history/token-history-item/evm-token-history-item.component';
import { EvmTokensHistoryUtils } from '@popup/evm/utils/evm-tokens-history.utils';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import FlatList from 'flatlist-react';
import React, { useEffect, useRef, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

const EvmTokenHistoryPage = ({
  token,
  account,
  chain,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [history, setHistory] = useState<EvmTokenHistory>();
  const [loading, setLoading] = useState(false);

  const historyItemList = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_tokens_history',
      titleParams: [token.tokenInfo.symbol],
      isBackButtonEnabled: true,
      // rightAction: {
      //   icon: SVGIcons.WALLET_HISTORY_FILTER_BUTTON,
      //   callback: toggleFilter,
      //   className: 'wallet-filter-button',
      // },
    });
    init();
  }, []);

  const init = async () => {
    setLoading(true);
    const res = await EvmTokensHistoryUtils.getHistory(
      token,
      chain,
      account.wallet.address,
      account.wallet.signingKey,
    );
    console.log(res);
    setHistory(res);
    setLoading(false);
  };

  return (
    <div className="evm-token-history">
      <div
        data-testid="wallet-item-list"
        ref={historyItemList}
        className="wallet-item-list">
        {history && (
          <FlatList
            list={history.events}
            renderItem={(event: any) => (
              <EvmTokenHistoryItemComponent
                key={event.transactionHash}
                historyItem={event}
                chain={chain}
              />
            )}
            renderOnScroll
            renderWhenEmpty={() => {
              if (!loading) {
                return (
                  <div className="empty-history-panel">
                    <SVGIcon icon={SVGIcons.MESSAGE_ERROR} />
                    <div className="text">
                      <div>
                        {chrome.i18n.getMessage(
                          'popup_html_transaction_list_is_empty',
                        )}
                      </div>
                      <div>
                        {chrome.i18n.getMessage(
                          'popup_html_transaction_list_is_empty_try_clear_filter',
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
            }}
          />
        )}
        {loading && (
          <div className="rotating-logo-container">
            <RotatingLogoComponent></RotatingLogoComponent>
          </div>
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    token: state.navigation.params.token as EVMToken,
    chain: state.chain as EvmChain,
    account: state.evm.accounts[0] as EvmAccount,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmTokenHistoryComponent = connector(EvmTokenHistoryPage);
