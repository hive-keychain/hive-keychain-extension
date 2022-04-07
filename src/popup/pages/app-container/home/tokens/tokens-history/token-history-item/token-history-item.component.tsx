import {
  CommentCurationTransaction,
  DelegateTokenTransaction,
  MiningLotteryTransaction,
  OperationsHiveEngine,
  StakeTokenTransaction,
  TokenTransaction,
  TransferTokenTransaction,
  UndelegateTokenDoneTransaction,
  UndelegateTokenStartTransaction,
  UnStakeTokenDoneTransaction,
  UnStakeTokenStartTransaction,
} from '@interfaces/tokens.interface';
import { RootState } from '@popup/store';
import moment from 'moment';
import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import './token-history-item.component.scss';

interface TokenHistoryItemProps {
  transaction: TokenTransaction;
}

const TokenHistoryItem = ({
  transaction,
  activeAccountName,
}: PropsFromRedux) => {
  const [isMemoOpened, setIsMemoOpened] = useState(false);

  const getLabel = () => {
    switch (transaction.operation) {
      case OperationsHiveEngine.CURATION_REWARD: {
        const t = transaction as CommentCurationTransaction;
        return chrome.i18n.getMessage(
          'popup_html_token_wallet_info_curation_reward',
          [t.amount],
        );
      }
      case OperationsHiveEngine.MINING_LOTTERY: {
        const t = transaction as MiningLotteryTransaction;
        return chrome.i18n.getMessage(
          'popup_html_token_wallet_info_mining_lottery',
          [t.amount, t.poolId],
        );
      }
      case OperationsHiveEngine.TOKENS_TRANSFER: {
        const t = transaction as TransferTokenTransaction;
        if (t.from === activeAccountName) {
          return chrome.i18n.getMessage(
            'popup_html_token_wallet_info_transfer_out',
            [t.amount, t.to],
          );
        } else {
          return chrome.i18n.getMessage(
            'popup_html_token_wallet_info_transfer_in',
            [t.amount, t.from],
          );
        }
      }
      case OperationsHiveEngine.TOKENS_DELEGATE: {
        const t = transaction as DelegateTokenTransaction;
        if (t.delegator === activeAccountName) {
          return chrome.i18n.getMessage(
            'popup_html_token_wallet_info_delegation_out',
            [t.amount, t.delegatee],
          );
        } else {
          return chrome.i18n.getMessage(
            'popup_html_token_wallet_info_delegation_in',
            [t.delegator, t.amount],
          );
        }
      }
      case OperationsHiveEngine.TOKEN_UNDELEGATE_START: {
        const t = transaction as UndelegateTokenStartTransaction;
        if (t.delegator === activeAccountName) {
          return chrome.i18n.getMessage(
            'popup_html_token_wallet_info_start_cancel_delegation_out',
            [t.amount, t.delegatee],
          );
        } else {
          return chrome.i18n.getMessage(
            'popup_html_token_wallet_info_start_cancel_delegation_in',
            [t.delegator, t.amount],
          );
        }
      }
      case OperationsHiveEngine.TOKEN_UNDELEGATE_DONE: {
        const t = transaction as UndelegateTokenDoneTransaction;
        if (t.delegator === activeAccountName) {
          return chrome.i18n.getMessage(
            'popup_html_token_wallet_info_cancel_delegation_out',
            [t.amount, t.delegatee],
          );
        } else {
          return chrome.i18n.getMessage(
            'popup_html_token_wallet_info_cancel_delegation_in',
            [t.delegator, t.amount],
          );
        }
      }
      case OperationsHiveEngine.TOKEN_STAKE: {
        const t = transaction as StakeTokenTransaction;
        if (t.from !== activeAccountName) {
          return chrome.i18n.getMessage(
            'popup_html_token_wallet_info_stake_other_user',
            [t.from, t.amount, t.to],
          );
        } else
          return chrome.i18n.getMessage('popup_html_token_wallet_info_stake', [
            t.amount,
          ]);
      }
      case OperationsHiveEngine.TOKEN_UNSTAKE_START: {
        const t = transaction as UnStakeTokenStartTransaction;
        return chrome.i18n.getMessage(
          'popup_html_token_wallet_info_start_unstake',
          [t.amount],
        );
      }
      case OperationsHiveEngine.TOKEN_UNSTAKE_DONE: {
        const t = transaction as UnStakeTokenDoneTransaction;
        return chrome.i18n.getMessage(
          'popup_html_token_wallet_info_unstake_done',
          [t.amount],
        );
      }
    }
  };

  const getMemo = () => {
    switch (transaction.operation) {
      case OperationsHiveEngine.TOKENS_TRANSFER: {
        const t = transaction as TransferTokenTransaction;
        return t.memo;
      }
      case OperationsHiveEngine.CURATION_REWARD: {
        const t = transaction as CommentCurationTransaction;
        return t.authorPerm;
      }
      default:
        return null;
    }
  };

  return (
    <div
      id={transaction._id}
      className={`token-history-item ${getMemo() ? 'has-memo' : ''}`}
      onClick={() => setIsMemoOpened(!isMemoOpened)}>
      <div className="transaction">
        <div className="information-panel">
          <div className="top-row">
            <div className="date">
              {moment(transaction.timestamp * 1000).format('L')}
            </div>
          </div>
          <div className="bottom-row">{getLabel()}</div>
        </div>
        <div
          className={isMemoOpened ? 'memo-panel opened' : 'memo-panel closed'}>
          {getMemo()}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccountName: state.activeAccount.name,
  };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector> & TokenHistoryItemProps;

export const TokenHistoryItemComponent = connector(TokenHistoryItem);
