import RotatingLogoComponent from '@common-ui/rotating-logo/rotating-logo.component';
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
import React, { useRef, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

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

  const goToDetailsPage = async (
    transactionHash: string,
    historyItem: EvmUserHistoryItem,
  ) => {
    const transactionResponse = await EthersUtils.getProvider(
      chain,
    ).getTransaction(transactionHash);

    console.log({ transactionResponse, historyItem });

    // const genericParams = {
    //   transactionResponse: transactionResponse,
    //   // tokenInfo: historyItem..tokenInfo,
    //   isCanceled: historyItem.isCanceled,
    //   pageTitle: historyItem.pageTitle,
    // };

    navigateToWithParams(EvmScreen.EVM_TRANSFER_RESULT_PAGE, {
      transactionResponse: transactionResponse,
      ...historyItem,
    });

    // switch (historyItem.type) {
    //   case EvmUserHistoryItemType.TRANSFER_IN: {
    //     navigateToWithParams(EvmScreen.EVM_TRANSFER_RESULT_PAGE, {
    //       ...genericParams,
    //       receiverAddress: (historyItem as EvmTokenTransferInHistoryItem).from,
    //       amount: (historyItem as EvmTokenTransferInHistoryItem).amount,
    //     });
    //     break;
    //   }
    //   case EvmUserHistoryItemType.TRANSFER_OUT: {
    //     navigateToWithParams(EvmScreen.EVM_TRANSFER_RESULT_PAGE, {
    //       ...genericParams,
    //       receiverAddress: (historyItem as EvmTokenTransferOutHistoryItem).to,
    //       amount: (historyItem as EvmTokenTransferOutHistoryItem).amount,
    //     });
    //     break;
    //   }
    //   default: {
    //     console.log('no nav set up');
    //     navigateToWithParams(EvmScreen.EVM_TRANSFER_RESULT_PAGE, {
    //       ...genericParams,
    //       receiverAddress: historyItem.receiverAddress
    //     });
    //     break;
    //   }
    // }
  };

  return (
    <>
      {history && (
        <>
          {history && (
            <FlatList
              ref={historyItemList}
              list={history.events}
              renderItem={(event: any) => (
                <EvmTokenHistoryItemComponent
                  key={event.transactionHash}
                  historyItem={event}
                  chain={chain}
                  goToDetailsPage={() => {
                    console.log(event);
                    goToDetailsPage(event.transactionHash, event);
                  }}
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
          {loading && <RotatingLogoComponent />}
        </>
      )}
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
});
type PropsFromRedux = ConnectedProps<typeof connector> & Props;

export const EvmHistoryComponent = connector(EvmHistory);
