import RotatingLogoComponent from '@common-ui/rotating-logo/rotating-logo.component';
import { loadEvmHistory } from '@popup/evm/actions/active-account.actions';
import { EvmActiveAccount } from '@popup/evm/interfaces/active-account.interface';
import {
  EvmUserHistory,
  EvmUserHistoryItem,
} from '@popup/evm/interfaces/evm-tokens-history.interface';
import { EvmTokenHistoryItemComponent } from '@popup/evm/pages/home/token-history/token-history-item/evm-token-history-item.component';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { navigateToWithParams } from '@popup/multichain/actions/navigation.actions';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import FlatList from 'flatlist-react';
import React, { useEffect, useRef, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

interface Props {
  activeAccount: EvmActiveAccount;
  chain: EvmChain;
  history?: EvmUserHistory;
  loading: boolean;
  onClickOnLoadMore: () => void;
}

export const EvmHistory = ({
  activeAccount,
  history,
  chain,
  loading,
  onClickOnLoadMore,
  navigateToWithParams,
  loadEvmHistory,
}: PropsFromRedux) => {
  const historyItemList = useRef<HTMLDivElement>(null);

  const [displayScrollToTop, setDisplayedScrollToTop] = useState(false);

  useEffect(() => {
    if (history && !activeAccount.history.initialized && !history.fullyFetch) {
      loadEvmHistory();
    }
  }, [history]);

  const goToDetailsPage = async (
    transactionHash: string,
    historyItem: EvmUserHistoryItem,
  ) => {
    const provider = await EthersUtils.getProvider(chain);
    const transactionResponse = await provider.getTransaction(transactionHash);

    navigateToWithParams(EvmScreen.EVM_TRANSFER_RESULT_PAGE, {
      transactionResponse: transactionResponse,
      ...historyItem,
    });
  };

  return (
    <>
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
            {chrome.i18n.getMessage('popup_html_load_more')}
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
                {chrome.i18n.getMessage('popup_html_transaction_list_is_empty')}
              </div>
            </div>
          </div>
        )}
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
  loadEvmHistory,
});
type PropsFromRedux = ConnectedProps<typeof connector> & Props;

export const EvmHistoryComponent = connector(EvmHistory);
