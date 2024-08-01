import { EVMToken } from '@popup/evm/interfaces/active-account.interface';
import { EvmTokenHistory } from '@popup/evm/interfaces/evm-tokens-history.interface';
import { PendingTransactionData } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmTokenHistoryItemComponent } from '@popup/evm/pages/home/token-history/token-history-item/evm-token-history-item.component';
import { EvmTokenHistoryPendingItemComponent } from '@popup/evm/pages/home/token-history/token-history-item/evm-token-history-pending-item.component';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
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
  account,
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
    if (!history || (history?.lastBlock && history.lastBlock >= 0)) {
      setLoading({ state: true });
      const res = await EvmTokensHistoryUtils.getHistory(
        token,
        chain,
        account.wallet.address,
        account.wallet.signingKey,
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
        history ? history.lastBlock : undefined,
      );
      const pendingTransactions =
        await EvmTransactionsUtils.getPendingTransactions(
          account.wallet.address,
          token.tokenInfo,
        );
      console.log({ pendingTransactions });
      setPendingTransactions(pendingTransactions);

      setHistory(res);
      setLoading({ state: false });
    }
  };

  const reload = () => {
    load();
  };

  const goToDetailsPage = (pendingTransactionData: PendingTransactionData) => {
    navigateToWithParams(EvmScreen.EVM_TRANSFER_RESULT_PAGE, {
      transactionResponse: pendingTransactionData.transaction,
      token: pendingTransactionData.tokenInfo,
      receiverAddress: pendingTransactionData.receiverAddress,
      amount: pendingTransactionData.amount,
      gasFee: pendingTransactionData.gasFee,
    });
  };

  return (
    <div className="evm-token-history">
      <div
        data-testid="wallet-item-list"
        ref={historyItemList}
        className="wallet-item-list">
        {history && (
          <>
            {pendingTransactions && pendingTransactions.length > 0 && (
              <>
                <div className="pending-transactions">
                  {pendingTransactions.map((pendingTransaction) => (
                    <EvmTokenHistoryPendingItemComponent
                      key={`pending-${pendingTransaction.transaction.hash}`}
                      chain={chain}
                      pendingTransactionData={pendingTransaction}
                      goToDetailsPage={(
                        transactionResponse: TransactionResponse,
                      ) =>
                        goToDetailsPage({
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
            {history.lastBlock > 0 && !loading.state && (
              <div className="load-more-panel" onClick={() => load(history)}>
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
    token: state.navigation.params.token as EVMToken,
    chain: state.chain as EvmChain,
    account: state.evm.accounts[0] as EvmAccount,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  navigateToWithParams,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmTokenHistoryComponent = connector(EvmTokenHistoryPage);
