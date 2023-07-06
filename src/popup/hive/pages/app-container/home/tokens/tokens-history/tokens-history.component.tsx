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
import { Screen } from '@reference-data/screen.enum';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { setTitleContainerProperties } from 'src/popup/hive/actions/title-container.actions';
import { loadTokenHistory } from 'src/popup/hive/actions/token.actions';
import { TokenHistoryItemComponent } from 'src/popup/hive/pages/app-container/home/tokens/tokens-history/token-history-item/token-history-item.component';
import { RootState } from 'src/popup/hive/store';
import { TokenTransactionUtils } from 'src/utils/token-transaction.utils';
import './tokens-history.component.scss';

const TokensHistory = ({
  activeAccountName,
  currentTokenBalance,
  tokenHistory,
  loadTokenHistory,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [displayedTransactions, setDisplayedTransactions] = useState<
    TokenTransaction[]
  >([]);

  const [filterValue, setFilterValue] = useState('');

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
      <div className="item-list">
        {displayedTransactions.map((transaction: TokenTransaction) => (
          <TokenHistoryItemComponent
            dataTestId={`token-history-item-${transaction.symbol}`}
            key={transaction._id}
            transaction={transaction}></TokenHistoryItemComponent>
        ))}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccountName: state.activeAccount?.name,
    userTokens: state.userTokens,
    currentTokenBalance: state.navigation.params?.tokenBalance as TokenBalance,
    tokenHistory: state.tokenHistory as TokenTransaction[],
  };
};

const connector = connect(mapStateToProps, {
  loadTokenHistory,
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const TokensHistoryComponent = connector(TokensHistory);
