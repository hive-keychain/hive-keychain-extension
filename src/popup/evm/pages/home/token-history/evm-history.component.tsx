import { Card } from '@common-ui/card/card.component';
import RotatingLogoComponent from '@common-ui/rotating-logo/rotating-logo.component';
import {
  EvmUserHistory,
  EvmUserHistoryItem,
} from '@popup/evm/interfaces/evm-tokens-history.interface';
import { EvmTokenHistoryItemComponent } from '@popup/evm/pages/home/token-history/token-history-item/evm-token-history-item.component';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import { EvmCustomHistoryInfoCardUtils } from '@popup/evm/utils/evm-custom-history-info-card.utils';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { navigateToWithParams } from '@popup/multichain/actions/navigation.actions';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import FlatList from 'flatlist-react';
import React, { useEffect, useRef, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

import { I18nUtils } from 'src/utils/i18n.utils';
interface Props {
  chain: EvmChain;
  history?: EvmUserHistory;
  loading: boolean;
  onClickOnLoadMore: () => void;
}

export const EvmHistory = ({
  history,
  chain,
  loading,
  onClickOnLoadMore,
  navigateToWithParams,
}: PropsFromRedux) => {
  const historyItemList = useRef<HTMLDivElement>(null);

  const [displayScrollToTop, setDisplayedScrollToTop] = useState(false);
  const [infoCardState, setInfoCardState] = useState<{
    ready: boolean;
    showCard: boolean;
  }>({ ready: false, showCard: false });

  useEffect(() => {
    let cancelled = false;

    const refreshInfoCard = async () => {
      if (!chain.isCustom) {
        if (!cancelled) {
          setInfoCardState({ ready: true, showCard: false });
        }
        return;
      }

      const hidden = await EvmCustomHistoryInfoCardUtils.isHiddenForChain(
        chain.chainId,
      );
      if (!cancelled) {
        setInfoCardState({ ready: true, showCard: !hidden });
      }
    };

    void refreshInfoCard();

    return () => {
      cancelled = true;
    };
  }, [chain.chainId, chain.isCustom]);

  const goToDetailsPage = async (
    transactionHash: string,
    historyItem: EvmUserHistoryItem,
  ) => {
    const provider = await EthersUtils.getProvider(chain);
    const transactionResponse = await provider.getTransaction(transactionHash);

    navigateToWithParams(EvmScreen.EVM_TRANSFER_RESULT_PAGE, {
      transactionResponse: transactionResponse,
      ...historyItem,
      isSuccess:
        historyItem.isCanceled || historyItem.isReverted ? false : true,
      isCanceled: historyItem.isCanceled,
      initialDisplayHistory: true,
    });
  };

  const handleHideInfoCard = async () => {
    await EvmCustomHistoryInfoCardUtils.setHiddenForChain(chain.chainId);
    setInfoCardState((prev) => ({ ...prev, showCard: false }));
  };

  return (
    <>
      {!loading && infoCardState.ready && infoCardState.showCard && (
        <Card className="evm-custom-erc20-empty-card evm-custom-history-info-card">
          <p className="evm-custom-erc20-empty-card__message">
            {I18nUtils.getMessage('evm_custom_history_info_card_message')}
          </p>
          <button
            type="button"
            className="evm-custom-erc20-empty-card__hide"
            onClick={() => void handleHideInfoCard()}>
            {I18nUtils.getMessage('evm_custom_erc20_empty_card_hide')}
          </button>
        </Card>
      )}
      {history && (
        <>
          {/* {pendingTransactionsItems && pendingTransactionsItems.length > 0 && (
            <>
              {pendingTransactionsItems.map((item, index) => (
                <EvmTokenHistoryItemComponent
                  key={`${item.transactionHash}-${index}`}
                  historyItem={item}
                  chain={chain}
                  goToDetailsPage={() => {
                    goToDetailsPage(item.transactionHash, item);
                  }}
                  index={index}
                />
              ))}
              <Separator type="horizontal" />
            </>
          )} */}
          {history && history.events && (
            <FlatList
              ref={historyItemList}
              list={history.events}
              renderItem={(event: any, index: number) => (
                <EvmTokenHistoryItemComponent
                  key={`${event.transactionHash}-${index}`}
                  historyItem={event}
                  chain={chain}
                  goToDetailsPage={() => {
                    goToDetailsPage(event.transactionHash, event);
                  }}
                  index={index}
                  hasDetails={false}
                />
              )}
              renderOnScroll
              renderWhenEmpty={() => {
                return <></>;
              }}
            />
          )}
        </>
      )}
      {!loading && history && !history.fullyFetch && (
        <div
          className="load-more-panel history-load-more"
          onClick={() => onClickOnLoadMore()}>
          <span className="label">
            {I18nUtils.getMessage('popup_html_load_more')}
          </span>
          <SVGIcon icon={SVGIcons.GLOBAL_ADD_CIRCLE}></SVGIcon>
        </div>
      )}
      {loading && (
        <div className="rotating-logo-container">
          <RotatingLogoComponent />
        </div>
      )}
      {!loading &&
        history &&
        history.fullyFetch &&
        history.events.length === 0 && (
          <div className="empty-history-panel evm-history-empty-panel">
            <SVGIcon icon={SVGIcons.MESSAGE_ERROR} />
            <div className="text">
              <div>
                {I18nUtils.getMessage('popup_html_transaction_list_is_empty')}
              </div>
            </div>
          </div>
        )}
    </>
  );
};

const connector = connect(null, {
  navigateToWithParams,
});
type PropsFromRedux = ConnectedProps<typeof connector> & Props;

export const EvmHistoryComponent = connector(EvmHistory);
