import { EvmUserHistory } from '@popup/evm/interfaces/evm-tokens-history.interface';
import { EvmTokenHistoryItemComponent } from '@popup/evm/pages/home/token-history/token-history-item/evm-token-history-item.component';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import FlatList from 'flatlist-react';
import React, { useRef, useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

interface Props {
  chain: EvmChain;
  history?: EvmUserHistory;
  loading: boolean;
  onClickOnLoadMore: () => void;
}

export const EvmHistoryComponent = ({
  history,
  chain,
  loading,
  onClickOnLoadMore,
}: Props) => {
  const historyItemList = useRef<HTMLDivElement>(null);

  const [displayScrollToTop, setDisplayedScrollToTop] = useState(false);

  return (
    <>
      {history && (
        <>
          {history && history.events.length > 0 && (
            <FlatList
              ref={historyItemList}
              list={history.events}
              renderItem={(event: any) => (
                <EvmTokenHistoryItemComponent
                  key={event.transactionHash}
                  historyItem={event}
                  chain={chain}
                  goToDetailsPage={
                    () => console.log(event)
                    //   goToDetailsPage(event.transactionHash, event)
                  }
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
          {!loading && !history.fullyFetch && (
            <div
              className="load-more-panel"
              onClick={() => onClickOnLoadMore()}>
              <span className="label">
                {chrome.i18n.getMessage('popup_html_load_more')}
              </span>
              <SVGIcon icon={SVGIcons.GLOBAL_ADD_CIRCLE}></SVGIcon>
            </div>
          )}
        </>
      )}
    </>
  );
};
