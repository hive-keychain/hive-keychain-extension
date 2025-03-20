import { NativeAndErc20Token } from '@popup/evm/interfaces/active-account.interface';
import {
  EvmTokenHistory,
  EvmTokenHistoryItem,
  EvmTokenHistoryItemType,
  EvmTokenTransferInHistoryItem,
  EvmTokenTransferOutHistoryItem,
} from '@popup/evm/interfaces/evm-tokens-history.interface';
import { PendingTransactionData } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmTokenHistoryItemComponent } from '@popup/evm/pages/home/token-history/token-history-item/evm-token-history-item.component';
import { EvmTokenHistoryPendingItemComponent } from '@popup/evm/pages/home/token-history/token-history-item/evm-token-history-pending-item.component';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmTokensHistoryUtils } from '@popup/evm/utils/evm-tokens-history.utils';
import { EvmTransactionsUtils } from '@popup/evm/utils/evm-transactions.utils';
import { navigateToWithParams } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import { TransactionResponse } from 'ethers';
import FlatList from 'flatlist-react';
import React, { useEffect, useRef, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { BackToTopButton } from 'src/common-ui/back-to-top-button/back-to-top-button.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { Separator } from 'src/common-ui/separator/separator.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

const EvmTokenHistoryPage = ({
  token,
  activeAccount,
  chain,
  setTitleContainerProperties,
  navigateToWithParams,
}: PropsFromRedux) => {
  const [pendingTransactions, setPendingTransactions] =
    useState<PendingTransactionData[]>();
  const [history, setHistory] = useState<EvmTokenHistory>();
  const [loading, setLoading] = useState<{ state: boolean; message?: string }>({
    state: false,
  });

  const historyItemList = useRef<HTMLDivElement>(null);

  const [displayScrollToTop, setDisplayedScrollToTop] = useState(false);

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
    load();
  }, []);

  const load = async (history?: EvmTokenHistory) => {
    const pendingTransactions =
      await EvmTransactionsUtils.getPendingTransactions(
        activeAccount.wallet.address,
        token.tokenInfo,
      );
    setPendingTransactions(pendingTransactions);

    if (!history || (history?.lastBlock && history.lastBlock >= 0)) {
      setLoading({ state: true });

      const res = await EvmTokensHistoryUtils.loadHistory(
        token,
        chain,
        activeAccount.wallet.address,
        activeAccount.wallet.signingKey,
        (progression) =>
          setLoading((oldLoading) => {
            return {
              ...oldLoading,
              message: chrome.i18n.getMessage(
                'popup_html_evm_history_loading_progression',
                [String(progression.nbBlocks), String(progression.totalBlocks)],
              ),
            };
          }),
      );

      setHistory(res);
      setLoading({ state: false });
    }
  };

  const reload = () => {
    load();
  };

  const goToPendingDetailsPage = (
    pendingTransactionData: PendingTransactionData,
  ) => {
    navigateToWithParams(EvmScreen.EVM_TRANSFER_RESULT_PAGE, {
      transactionResponse: pendingTransactionData.transaction,
      tokenInfo: pendingTransactionData.tokenInfo,
      receiverAddress: pendingTransactionData.receiverAddress,
      amount: pendingTransactionData.amount,
      gasFee: pendingTransactionData.gasFee,
    });
  };

  const goToDetailsPage = async (
    transactionHash: string,
    historyItem: EvmTokenHistoryItem,
  ) => {
    const transactionResponse = await EthersUtils.getProvider(
      chain,
    ).getTransaction(transactionHash);
    switch (historyItem.type) {
      case EvmTokenHistoryItemType.TRANSFER_IN: {
        navigateToWithParams(EvmScreen.EVM_TRANSFER_RESULT_PAGE, {
          transactionResponse: transactionResponse,
          tokenInfo: token.tokenInfo,
          receiverAddress: (historyItem as EvmTokenTransferInHistoryItem).from,
          amount: (historyItem as EvmTokenTransferInHistoryItem).amount,
          isCanceled: historyItem.isCanceled,
        });
        break;
      }
      case EvmTokenHistoryItemType.TRANSFER_OUT: {
        navigateToWithParams(EvmScreen.EVM_TRANSFER_RESULT_PAGE, {
          transactionResponse: transactionResponse,
          token: token.tokenInfo,
          receiverAddress: (historyItem as EvmTokenTransferOutHistoryItem).to,
          amount: (historyItem as EvmTokenTransferOutHistoryItem).amount,
          isCanceled: historyItem.isCanceled,
        });
        break;
      }
    }
  };

  const loadMore = async () => {
    setLoading({ state: true });
    const res = await EvmTokensHistoryUtils.loadMore(
      token,
      chain,
      activeAccount.wallet.address,
      activeAccount.wallet.signingKey,
      history!,
      (progression) =>
        setLoading((oldLoading) => {
          return {
            ...oldLoading,
            message: chrome.i18n.getMessage(
              'popup_html_evm_history_loading_progression',
              [String(progression.nbBlocks), String(progression.totalBlocks)],
            ),
          };
        }),
    );
    setHistory({ ...history, ...res });
    setLoading({ state: false });
  };

  return (
    <div className="evm-token-history">
      <div
        data-testid="wallet-item-list"
        ref={historyItemList}
        className="wallet-item-list">
        {pendingTransactions && pendingTransactions.length > 0 && (
          <>
            <div className="pending-transactions">
              {pendingTransactions.map((pendingTransaction) => (
                <EvmTokenHistoryPendingItemComponent
                  key={`pending-${pendingTransaction.transaction.hash}`}
                  chain={chain}
                  pendingTransactionData={pendingTransaction}
                  goToDetailsPage={(transactionResponse: TransactionResponse) =>
                    goToPendingDetailsPage({
                      ...pendingTransaction,
                      transaction: transactionResponse,
                    })
                  }
                  triggerRefreshHistory={() => reload()}
                />
              ))}
            </div>
            <Separator type="horizontal" fullSize />
          </>
        )}

        {history && (
          <>
            {history.events.length > 0 && (
              <FlatList
                list={history.events}
                renderItem={(event: any) => (
                  <EvmTokenHistoryItemComponent
                    key={event.transactionHash}
                    historyItem={event}
                    chain={chain}
                    goToDetailsPage={() =>
                      goToDetailsPage(event.transactionHash, event)
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
            {history.firstBlock > 0 && !loading.state && (
              <div className="load-more-panel" onClick={() => loadMore()}>
                <span className="label">
                  {chrome.i18n.getMessage('popup_html_load_more')}
                </span>
                <SVGIcon icon={SVGIcons.GLOBAL_ADD_CIRCLE}></SVGIcon>
              </div>
            )}
          </>
        )}
        {loading.state && (
          <div className="rotating-logo-container">
            <RotatingLogoComponent></RotatingLogoComponent>
            {loading.message && (
              <div className="caption">{loading.message}</div>
            )}
          </div>
        )}
      </div>
      {displayScrollToTop && <BackToTopButton element={historyItemList} />}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    token: state.navigation.params.token as NativeAndErc20Token,
    chain: state.chain as EvmChain,
    activeAccount: state.evm.activeAccount,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  navigateToWithParams,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmTokenHistoryComponent = connector(EvmTokenHistoryPage);
