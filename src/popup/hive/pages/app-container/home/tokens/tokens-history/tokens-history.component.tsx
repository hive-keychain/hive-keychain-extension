import { Screen } from '@interfaces/screen.interface';
import {
  CommentCurationTransaction,
  CURATIONS_REWARDS_TYPES,
  DelegationTokenTransaction,
  MiningLotteryTransaction,
  OperationsHiveEngine,
  StakeTokenTransaction,
  TokenBalance,
  TokenTransaction,
  TransferTokenTransaction,
} from '@interfaces/tokens.interface';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { BackToTopButton } from 'src/common-ui/back-to-top-button/back-to-top-button.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import {
  fetchMoreTokenHistory,
  loadTokenHistory,
} from 'src/popup/hive/actions/token.actions';
import { TokenHistoryItemComponent } from 'src/popup/hive/pages/app-container/home/tokens/tokens-history/token-history-item/token-history-item.component';
import { TokenTransactionUtils } from 'src/popup/hive/utils/token-transaction.utils';

const TokensHistory = ({
  activeAccountName,
  currentTokenBalance,
  tokenHistory,
  loadTokenHistory,
  setTitleContainerProperties,
  isTokenHistoryLoading,
  shouldLoadMore,
  fetchMoreTokenHistory,
}: PropsFromRedux) => {
  const [displayedTransactions, setDisplayedTransactions] = useState<
    TokenTransaction[]
  >([]);
  const [filterValue, setFilterValue] = useState('');
  const [displayScrollToTop, setDisplayedScrollToTop] = useState(false);

  const walletItemList = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTokenHistory(activeAccountName!, currentTokenBalance.symbol);
    setTitleContainerProperties({
      title: 'popup_html_tokens_history',
      titleParams: [currentTokenBalance.symbol],
      isBackButtonEnabled: true,
    });
  }, []);

  useEffect(() => {
    setDisplayedTransactions(
      tokenHistory.filter((item) => {
        return (
          (CURATIONS_REWARDS_TYPES.includes(item.operation) &&
            TokenTransactionUtils.filterCurationReward(
              item as CommentCurationTransaction,
              filterValue,
            )) ||
          (item.operation === OperationsHiveEngine.TOKENS_TRANSFER &&
            TokenTransactionUtils.filterTransfer(
              item as TransferTokenTransaction,
              filterValue,
            )) ||
          (item.operation === OperationsHiveEngine.TOKEN_STAKE &&
            TokenTransactionUtils.filterStake(
              item as StakeTokenTransaction,
              filterValue,
            )) ||
          (item.operation === OperationsHiveEngine.MINING_LOTTERY &&
            TokenTransactionUtils.filterMiningLottery(
              item as MiningLotteryTransaction,
              filterValue,
            )) ||
          (item.operation === OperationsHiveEngine.TOKENS_DELEGATE &&
            TokenTransactionUtils.filterDelegation(
              item as DelegationTokenTransaction,
              filterValue,
            )) ||
          item.amount.toLowerCase().includes(filterValue.toLowerCase()) ||
          item.operation.toLowerCase().includes(filterValue.toLowerCase()) ||
          (item.timestamp &&
            moment(item.timestamp)
              .format('L')
              .includes(filterValue.toLowerCase()))
        );
      }),
    );
  }, [tokenHistory, filterValue]);

  const handleScroll = (event: any) => {
    setDisplayedScrollToTop(event.target.scrollTop !== 0);
  };

  return (
    <div
      data-testid={`${Screen.TOKENS_HISTORY}-page`}
      className="tokens-history">
      <InputComponent
        dataTestId="input-filter-box"
        type={InputType.TEXT}
        placeholder="popup_html_search"
        value={filterValue}
        onChange={setFilterValue}
      />
      <div className="item-list" ref={walletItemList} onScroll={handleScroll}>
        {displayedTransactions.map((transaction: TokenTransaction) => (
          <TokenHistoryItemComponent
            dataTestId={`token-history-item-${transaction.symbol}`}
            key={transaction._id}
            transaction={transaction}></TokenHistoryItemComponent>
        ))}
        {displayedTransactions.length === 0 && !isTokenHistoryLoading && (
          <div className="empty-history-panel">
            <SVGIcon icon={SVGIcons.MESSAGE_ERROR} />
            <div className="text">
              <div>
                {chrome.i18n.getMessage('popup_html_transaction_list_is_empty')}
              </div>
              <div>
                {chrome.i18n.getMessage(
                  'popup_html_transaction_list_is_empty_try_clear_filter',
                )}
              </div>
            </div>
          </div>
        )}
        {shouldLoadMore && !isTokenHistoryLoading && (
          <div
            className="load-more-panel"
            onClick={() => {
              fetchMoreTokenHistory(
                activeAccountName!,
                currentTokenBalance.symbol,
              );
            }}>
            <span className="label">
              {chrome.i18n.getMessage('popup_html_load_more')}
            </span>
            <SVGIcon icon={SVGIcons.GLOBAL_ADD_CIRCLE}></SVGIcon>
          </div>
        )}
        {isTokenHistoryLoading && (
          <div className="rotating-logo-container">
            <RotatingLogoComponent></RotatingLogoComponent>
          </div>
        )}
      </div>
      {displayScrollToTop && <BackToTopButton element={walletItemList} />}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccountName: state.hive.activeAccount?.name,
    userTokens: state.hive.userTokens,
    currentTokenBalance: state.navigation.params?.tokenBalance as TokenBalance,
    tokenHistory: state.hive.tokenHistory.list as TokenTransaction[],
    isTokenHistoryLoading: state.hive.tokenHistory.loading,
    shouldLoadMore: state.hive.tokenHistory.shouldLoadMore,
  };
};

const connector = connect(mapStateToProps, {
  loadTokenHistory,
  setTitleContainerProperties,
  fetchMoreTokenHistory,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const TokensHistoryComponent = connector(TokensHistory);
